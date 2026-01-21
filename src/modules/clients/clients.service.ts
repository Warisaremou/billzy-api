import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { Repository } from "typeorm";

import { CreateClientDto } from "./dto/create-client.dto";
import { UpdateClientDto } from "./dto/update-client.dto";
import { Client } from "./entities/client.entity";

@Injectable()
export class ClientsService {
  private readonly logger = new Logger(ClientsService.name);

  constructor(
    @InjectRepository(Client)
    private readonly clientsRepository: Repository<Client>,
  ) {}

  async addClient(companyId: string, createClientDto: CreateClientDto): Promise<Client> {
    const client = this.clientsRepository.create({
      ...createClientDto,
      companies: [{ id: companyId }] as any,
    });
    const savedClient = await this.clientsRepository.save(client);
    this.logger.log(`Client created: ${savedClient.id} for company: ${companyId}`);
    return savedClient;
  }

  async getAllClients(): Promise<Client[]> {
    this.logger.log("Fetching all clients");
    return await this.clientsRepository.find();
  }

  async getCompanyClients(companyId: string): Promise<Client[]> {
    this.logger.log(`Fetching clients for company: ${companyId}`);
    return await this.clientsRepository.find({
      where: {
        companies: {
          id: companyId,
        },
      },
    });
  }

  async getClientsByCompany(companyId: string): Promise<Client[]> {
    this.logger.log(`Fetching clients for company: ${companyId}`);
    return await this.clientsRepository.find({
      where: {
        companies: {
          id: companyId,
        },
      },
    });
  }

  async getClient(id: string): Promise<Client> {
    this.logger.log(`Fetching client with id: ${id}`);
    const client = await this.clientExists(id);

    return client;
  }

  async updateClient(id: string, updateClientDto: UpdateClientDto): Promise<Client> {
    const client = await this.clientsRepository.preload({
      id,
      ...updateClientDto,
    });

    if (!client) {
      throw new NotFoundException("Client not found");
    }

    const updatedClient = await this.clientsRepository.save(client);
    this.logger.log(`Client updated: ${id}`);
    return updatedClient;
  }

  async removeClient(id: string): Promise<void> {
    await this.clientExists(id);
    await this.clientsRepository.delete(id);
    this.logger.log(`Client deleted: ${id}`);
  }

  async clientExists(clientId: string): Promise<Client> {
    const client = await this.clientsRepository.findOne({ where: { id: clientId } });

    if (!client) {
      throw new NotFoundException("Client not found");
    }

    return client;
  }
}
