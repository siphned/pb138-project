<<<<<<< HEAD
import { ForbiddenError } from "@repo/shared";
import type { SupplyAgreement } from "@repo/shared/schemas";
import { db } from "../../db";
import { ForbiddenShopActionError } from "../shops/shops.errors";
import * as shopsRepo from "../shops/shops.repository";
import * as winemakersRepo from "../winemakers/winemakers.repository";
import {
  AlreadyRespondedError,
  NotAWinemakerError,
  SupplyAgreementNotFoundError,
} from "./supply-agreements.errors";
import * as supplyAgreementsRepo from "./supply-agreements.repository";

export class SupplyAgreementsService {
=======
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

>>>>>>> origin/main
  async createRequest(
    userId: string,
    winemakerId: string,
    shopId: string
  ): Promise<SupplyAgreement> {
<<<<<<< HEAD
    const shop = await shopsRepo.findById(db, shopId);
    if (!shop || shop.ownerUserId !== userId) {
      throw new ForbiddenShopActionError();
    }

    const existing = await supplyAgreementsRepo.findByShopAndWinemaker(db, shopId, winemakerId);
=======
    const shop = await this.shopsRepo.findById(shopId);
    if (!shop || shop.ownerUserId !== userId) {
      throw new Error("FORBIDDEN");
    }

    const existing = await this.supplyAgreementsRepo.findByShopAndWinemaker(shopId, winemakerId);
>>>>>>> origin/main
    if (existing) {
      return existing;
    }

<<<<<<< HEAD
    return supplyAgreementsRepo.create(db, { shopId, winemakerId });
  }

  async listForShop(userId: string, shopId: string): Promise<SupplyAgreement[]> {
    const shop = await shopsRepo.findById(db, shopId);
    if (!shop || shop.ownerUserId !== userId) {
      throw new ForbiddenShopActionError();
    }

    return supplyAgreementsRepo.listForShop(db, shopId);
  }

  async listForWinemaker(userId: string): Promise<SupplyAgreement[]> {
    const winemaker = await winemakersRepo.findByUserId(db, userId);
    if (!winemaker) throw new NotAWinemakerError();

    return supplyAgreementsRepo.listForWinemaker(db, winemaker.id);
=======
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
>>>>>>> origin/main
  }

  async respondToRequest(
    userId: string,
    agreementId: string,
    status: "approved" | "rejected"
  ): Promise<SupplyAgreement> {
<<<<<<< HEAD
    const agreement = await supplyAgreementsRepo.findById(db, agreementId);
    if (!agreement) throw new SupplyAgreementNotFoundError();

    const winemaker = await winemakersRepo.findById(db, agreement.winemakerId);
    if (!winemaker || winemaker.userId !== userId) throw new ForbiddenError();

    if (agreement.status !== "pending") throw new AlreadyRespondedError();

    const updated = await supplyAgreementsRepo.updateStatus(db, agreementId, status);
    if (!updated) throw new SupplyAgreementNotFoundError();
=======
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
>>>>>>> origin/main

    return updated;
  }
}

<<<<<<< HEAD
export const supplyAgreementsService = new SupplyAgreementsService();
=======
export const supplyAgreementsService = new SupplyAgreementsService(
  supplyAgreementsRepository,
  shopsRepository,
  winemakersRepository
);
>>>>>>> origin/main
