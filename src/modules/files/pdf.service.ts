import { Injectable } from "@nestjs/common";
import * as fs from "fs-extra";
import * as handlebars from "handlebars";
import * as path from "path";
import { PDFDocument } from "pdf-lib";
import * as puppeteer from "puppeteer";
import { Invoice } from "../invoice/entities/invoice.entity";
import { PaymentDetail } from "../payment_details/entities/payment_detail.entity";
import { TermsCondition } from "../terms_conditions/entities/terms_condition.entity";
import { FacturXService } from "./facturx.service";

@Injectable()
export class PdfService {
  constructor(private readonly facturXService: FacturXService) {}

  async generateInvoice(
    invoice: Invoice,
    payment_details: PaymentDetail[],
    terms_condition: TermsCondition,
  ): Promise<Uint8Array<ArrayBufferLike>> {
    const templatePath = path.join(process.cwd(), "src/modules/invoice/templates/invoice.hbs");
    const cssPath = path.join(process.cwd(), "src/modules/invoice/templates/styles/invoice.css");
    const fontsCssPath = path.join(process.cwd(), "src/assets/fonts/fonts.css");

    const templateHtml = await fs.readFile(templatePath, "utf-8");
    const cssContent = await fs.readFile(cssPath, "utf-8");
    const fontsCss = await fs.readFile(fontsCssPath, "utf-8");

    const template = handlebars.compile(templateHtml);

    // Format data for template
    const items = await invoice.items;
    const formattedItems = items.map((item) => ({
      label: item.label,
      description: item.description,
      quantity: item.quantity,
      unitPrice: Number(item.unit_price).toFixed(2),
      vatRate: `${Number(item.vat_rate).toFixed(2)}%`,
      totalLine: Number(item.unit_total_ht).toFixed(2),
    }));

    const templateData = {
      invoiceNumber: invoice.reference,
      issueDate: invoice.issue_date ? new Date(invoice.issue_date).toLocaleDateString("fr-FR") : "--/--/----",
      dueDate: new Date(invoice.due_date).toLocaleDateString("fr-FR"),
      logoUrl: invoice.company.logo_url,
      sender: {
        contactName: invoice.company.name,
        companyName: invoice.company.name,
        address: invoice.company.address_street,
        zip: invoice.company.address_zipcode,
        city: invoice.company.address_city,
        country: invoice.company.address_country,
        fullAddress: `${invoice.company.address_street}\n${invoice.company.address_zipcode} ${invoice.company.address_city}, ${invoice.company.address_country}`,
        phone: invoice.company.phone,
        vatNumber: invoice.company.tva_number,
        siret: invoice.company.siret,
      },
      client: {
        contactName: invoice.client.name,
        companyName: invoice.client.name,
        address: invoice.client.address_street,
        zip: invoice.client.address_zipcode,
        city: invoice.client.address_city,
        country: invoice.client.address_country,
        fullAddress: `${invoice.client.address_street}\n${invoice.client.address_zipcode} ${invoice.client.address_city}, ${invoice.client.address_country}`,
        phone: invoice.client.phone,
        vatNumber: invoice.client.tva_number,
        siret: invoice.client.siret,
      },
      items: formattedItems,
      totalHT: Number(invoice.total_ht).toFixed(2),
      totalVAT: Number(invoice.total_vat).toFixed(2),
      totalTTC: Number(invoice.total_ttc).toFixed(2),
      termsAndConditions: terms_condition.content,
      paymentTerms: `${new Date(invoice.due_date).toLocaleDateString("fr-FR")}`,
      bank: payment_details[0]
        ? {
            iban: payment_details[0].iban,
            bic: payment_details[0].bic,
            bankName: payment_details[0].bank_name,
            ownerName: payment_details[0].owner_name,
          }
        : null,
    };

    const htmlContent = template(templateData);

    // Inject fonts CSS and regular CSS into the HTML before closing head tag
    const finalHtml = htmlContent.replace("</head>", `<style>${fontsCss}</style><style>${cssContent}</style></head>`);

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox"],
    });
    const page = await browser.newPage();

    await page.setContent(finalHtml, {
      waitUntil: "networkidle0",
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: "<div></div>",
      footerTemplate: `
        <div style="width: 100%; font-size: 10px; padding: 10px 20px; text-align: right; color: #444444ff; font-family: Inter, Arial, sans-serif;">
          <span>Page <span class="pageNumber"></span>/<span class="totalPages"></span></span>
        </div>
      `,
      margin: {
        top: "20px",
        bottom: "60px",
        left: "20px",
        right: "20px",
      },
    });

    await browser.close();

    // Generate Factur-X XML
    const facturXXml = await this.facturXService.generateFacturXXml(invoice, payment_details, terms_condition);

    // Embed XML into PDF to create Factur-X compliant PDF/A-3
    const pdfWithXml = await this.embedFacturXXml(pdfBuffer, facturXXml, invoice.reference);

    return pdfWithXml;
  }

  /**
   * Embeds Factur-X XML into PDF to create PDF/A-3 compliant invoice
   */
  private async embedFacturXXml(
    pdfBuffer: Uint8Array<ArrayBufferLike>,
    xmlContent: string,
    invoiceReference: string,
  ): Promise<Uint8Array<ArrayBufferLike>> {
    // Load the PDF
    const pdfDoc = await PDFDocument.load(pdfBuffer);

    // Embed the Factur-X XML as an attachment
    await pdfDoc.attach(Buffer.from(xmlContent, "utf-8"), "factur-x.xml", {
      mimeType: "text/xml",
      description: `Factur-X XML pour la facture ${invoiceReference}`,
      creationDate: new Date(),
      modificationDate: new Date(),
    });

    // Add PDF/A-3 metadata
    pdfDoc.setTitle(`Facture ${invoiceReference}`);
    pdfDoc.setSubject("Factur-X Facture");
    pdfDoc.setKeywords(["facture", "factur-x", invoiceReference]);
    pdfDoc.setProducer("Billzy");
    pdfDoc.setCreator("Système de facturation Billzy");

    // Save the modified PDF
    const pdfBytes = await pdfDoc.save();
    return new Uint8Array(pdfBytes);
  }
}
