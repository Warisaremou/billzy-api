import { Injectable } from "@nestjs/common";
import { Builder } from "xml2js";
import { Invoice } from "../invoice/entities/invoice.entity";
import { PaymentDetail } from "../payment_details/entities/payment_detail.entity";
import { TermsCondition } from "../terms_conditions/entities/terms_condition.entity";

@Injectable()
export class FacturXService {
  /**
   * Generates Factur-X compliant XML (CII format - Cross Industry Invoice)
   * Following EN 16931 standard for French e-invoicing (FNFE-MPE)
   */
  async generateFacturXXml(
    invoice: Invoice,
    payment_details: PaymentDetail[],
    terms_condition: TermsCondition,
  ): Promise<string> {
    const items = await invoice.items;

    // Format dates to YYYYMMDD format (UNCEFACT date format)
    const formatDate = (date: Date): string => {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}${month}${day}`;
    };

    // Build Factur-X XML structure (CII format)
    const xmlObject = {
      "rsm:CrossIndustryInvoice": {
        $: {
          "xmlns:rsm": "urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100",
          "xmlns:qdt": "urn:un:unece:uncefact:data:standard:QualifiedDataType:100",
          "xmlns:ram": "urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100",
          "xmlns:xs": "http://www.w3.org/2001/XMLSchema",
          "xmlns:udt": "urn:un:unece:uncefact:data:standard:UnqualifiedDataType:100",
        },
        "rsm:ExchangedDocumentContext": [
          {
            "ram:GuidelineSpecifiedDocumentContextParameter": [
              {
                "ram:ID": ["urn:cen.eu:en16931:2017#compliant#urn:factur-x.eu:1p0:extended"],
              },
            ],
          },
        ],
        "rsm:ExchangedDocument": [
          {
            "ram:ID": [invoice.reference],
            "ram:TypeCode": ["380"], // 380 = Commercial invoice
            "ram:IssueDateTime": [
              {
                "udt:DateTimeString": [
                  {
                    $: { format: "102" }, // 102 = CCYYMMDD format
                    _: formatDate(invoice.issue_date || new Date()),
                  },
                ],
              },
            ],
            "ram:IncludedNote": [
              {
                "ram:Content": [terms_condition.content],
              },
            ],
          },
        ],
        "rsm:SupplyChainTradeTransaction": [
          {
            // Line items
            "ram:IncludedSupplyChainTradeLineItem": items.map((item, index) => ({
              "ram:AssociatedDocumentLineDocument": [
                {
                  "ram:LineID": [String(index + 1)],
                },
              ],
              "ram:SpecifiedTradeProduct": [
                {
                  "ram:Name": [item.label],
                  "ram:Description": [item.description || ""],
                },
              ],
              "ram:SpecifiedLineTradeAgreement": [
                {
                  "ram:NetPriceProductTradePrice": [
                    {
                      "ram:ChargeAmount": [Number(item.unit_price).toFixed(2)],
                    },
                  ],
                },
              ],
              "ram:SpecifiedLineTradeDelivery": [
                {
                  "ram:BilledQuantity": [
                    {
                      $: { unitCode: "C62" }, // C62 = unit
                      _: String(item.quantity),
                    },
                  ],
                },
              ],
              "ram:SpecifiedLineTradeSettlement": [
                {
                  "ram:ApplicableTradeTax": [
                    {
                      "ram:TypeCode": ["VAT"],
                      "ram:CategoryCode": ["S"], // S = Standard rate
                      "ram:RateApplicablePercent": [Number(item.vat_rate).toFixed(2)],
                    },
                  ],
                  "ram:SpecifiedTradeSettlementLineMonetarySummation": [
                    {
                      "ram:LineTotalAmount": [Number(item.unit_total_ht).toFixed(2)],
                    },
                  ],
                },
              ],
            })),

            // Seller (Émetteur)
            "ram:ApplicableHeaderTradeAgreement": [
              {
                "ram:SellerTradeParty": [
                  {
                    "ram:Name": [invoice.company.name],
                    "ram:SpecifiedLegalOrganization": [
                      {
                        "ram:ID": [
                          {
                            $: { schemeID: "0002" }, // 0002 = SIREN/SIRET
                            _: invoice.company.siret,
                          },
                        ],
                      },
                    ],
                    "ram:PostalTradeAddress": [
                      {
                        "ram:LineOne": [invoice.company.address_street],
                        "ram:CityName": [invoice.company.address_city],
                        "ram:PostcodeCode": [invoice.company.address_zipcode],
                        "ram:CountryID": [invoice.company.address_country],
                      },
                    ],
                    "ram:SpecifiedTaxRegistration": [
                      {
                        "ram:ID": [
                          {
                            $: { schemeID: "VA" }, // VA = VAT
                            _: invoice.company.tva_number,
                          },
                        ],
                      },
                    ],
                  },
                ],
                // Buyer (Client)
                "ram:BuyerTradeParty": [
                  {
                    "ram:Name": [invoice.client.name],
                    "ram:SpecifiedLegalOrganization": [
                      {
                        "ram:ID": [
                          {
                            $: { schemeID: "0002" },
                            _: invoice.client.siret,
                          },
                        ],
                      },
                    ],
                    "ram:PostalTradeAddress": [
                      {
                        "ram:LineOne": [invoice.client.address_street],
                        "ram:CityName": [invoice.client.address_city],
                        "ram:PostcodeCode": [invoice.client.address_zipcode],
                        "ram:CountryID": [invoice.client.address_country],
                      },
                    ],
                    "ram:SpecifiedTaxRegistration": [
                      {
                        "ram:ID": [
                          {
                            $: { schemeID: "VA" },
                            _: invoice.client.tva_number,
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],

            // Delivery
            "ram:ApplicableHeaderTradeDelivery": [
              {
                "ram:ActualDeliverySupplyChainEvent": [
                  {
                    "ram:OccurrenceDateTime": [
                      {
                        "udt:DateTimeString": [
                          {
                            $: { format: "102" },
                            _: formatDate(invoice.issue_date || new Date()),
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],

            // Settlement (Payment & totals)
            "ram:ApplicableHeaderTradeSettlement": [
              {
                "ram:InvoiceCurrencyCode": ["EUR"],
                "ram:SpecifiedTradeSettlementPaymentMeans": payment_details[0]
                  ? [
                      {
                        "ram:TypeCode": ["30"], // 30 = Credit transfer
                        "ram:PayeePartyCreditorFinancialAccount": [
                          {
                            "ram:IBANID": [payment_details[0].iban],
                            "ram:AccountName": [payment_details[0].owner_name],
                          },
                        ],
                        "ram:PayeeSpecifiedCreditorFinancialInstitution": [
                          {
                            "ram:BICID": [payment_details[0].bic],
                            "ram:Name": [payment_details[0].bank_name],
                          },
                        ],
                      },
                    ]
                  : [],
                "ram:ApplicableTradeTax": [
                  {
                    "ram:CalculatedAmount": [Number(invoice.total_vat).toFixed(2)],
                    "ram:TypeCode": ["VAT"],
                    "ram:BasisAmount": [Number(invoice.total_ht).toFixed(2)],
                    "ram:CategoryCode": ["S"],
                  },
                ],
                "ram:SpecifiedTradePaymentTerms": [
                  {
                    "ram:DueDateDateTime": [
                      {
                        "udt:DateTimeString": [
                          {
                            $: { format: "102" },
                            _: formatDate(invoice.due_date),
                          },
                        ],
                      },
                    ],
                  },
                ],
                "ram:SpecifiedTradeSettlementHeaderMonetarySummation": [
                  {
                    "ram:LineTotalAmount": [Number(invoice.total_ht).toFixed(2)],
                    "ram:TaxBasisTotalAmount": [Number(invoice.total_ht).toFixed(2)],
                    "ram:TaxTotalAmount": [
                      {
                        $: { currencyID: "EUR" },
                        _: Number(invoice.total_vat).toFixed(2),
                      },
                    ],
                    "ram:GrandTotalAmount": [Number(invoice.total_ttc).toFixed(2)],
                    "ram:DuePayableAmount": [Number(invoice.total_ttc).toFixed(2)],
                  },
                ],
              },
            ],
          },
        ],
      },
    };

    // Build XML with proper formatting
    const builder = new Builder({
      xmldec: { version: "1.0", encoding: "UTF-8" },
      renderOpts: { pretty: true, indent: "  " },
    });

    return builder.buildObject(xmlObject);
  }
}
