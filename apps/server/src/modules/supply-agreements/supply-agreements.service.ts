import type { SupplyAgreement } from "@repo/shared/schemas";
import { type IShopsRepository, shopsRepository } from "../shops/shops.repository";
import {
  type IWinemakersRepository,
  winemakersRepository,
} from "../winemakers/winemakers.repository";
import {
  type ISupplyAgreementsRepository,
  supplyAgreementsRepository,
} from "./supply-agreements.repository";

export class SupplyAgreementsService {
  constructor(
    private supplyAgreementsRepo: ISupplyAgreementsRepository,
    private shopsRepo: IShopsRepository,
    private winemakersRepo: IWinemakersRepository
  ) {}

  async createRequest(
    userId: string,
    winemakerId: string,
    shopId: string
  ): Promise<SupplyAgreement> {
    const shop = await this.shopsRepo.findById(shopId);
    if (!shop || shop.ownerUserId !== userId) {
      throw new Error("FORBIDDEN");
    }

    const existing = await this.supplyAgreementsRepo.findByShopAndWinemaker(shopId, winemakerId);
    if (existing) {
      return existing;
    }

    return this.supplyAgreementsRepo.create({ shopId, winemakerId });
  }

  async listForShop(userId: string, shopId: string): Promise<SupplyAgreement[]> {
    const shop = await this.shopsRepo.findById(shopId);
    if (!shop || shop.ownerUserId !== userId) {
      throw new Error("FORBIDDEN");
    }

    return this.supplyAgreementsRepo.listForShop(shopId);
  }

  async listForWinemaker(userId: string): Promise<SupplyAgreement[]> {
    const winemaker = await this.winemakersRepo.findByUserId(userId);
    if (!winemaker) {
      throw new Error("NOT_A_WINEMAKER");
    }

    return this.supplyAgreementsRepo.listForWinemaker(winemaker.id);
  }

  async respondToRequest(
    userId: string,
    agreementId: string,
    status: "approved" | "rejected"
  ): Promise<SupplyAgreement> {
    const agreement = await this.supplyAgreementsRepo.findById(agreementId);
    if (!agreement) throw new Error("NOT_FOUND");

    const winemaker = await this.winemakersRepo.findById(agreement.winemakerId);
    if (!winemaker || winemaker.userId !== userId) {
      throw new Error("FORBIDDEN");
    }

    if (agreement.status !== "pending") {
      throw new Error("ALREADY_RESPONDED");
    }

    const updated = await this.supplyAgreementsRepo.updateStatus(agreementId, status);
    if (!updated) throw new Error("NOT_FOUND");

    return updated;
  }
}

export const supplyAgreementsService = new SupplyAgreementsService(
  supplyAgreementsRepository,
  shopsRepository,
  winemakersRepository
);
