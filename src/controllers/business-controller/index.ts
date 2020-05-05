import { BusinessDeleteArgs } from '@root/src/models/business/BusinessDeleteArgs';
import { BusinessReadArgs } from '@root/src/models/business/BusinessReadArgs';
import { BusinessCreateArgs } from '@root/src/models/business/BusinessCreateArgs';
import { Business } from '@root/src/models/business/business';
import { businessPersistanceController } from '../data-controller/business/BusinessPersistanceController';
import { BusinessPersistanceControllerBase } from '../data-controller/business/BusinessPersistanceControllerBase';
import { AddRuleArgs } from '@root/src/models/business/AddRuleArgs';

export class BusinessesController implements BusinessPersistanceControllerBase {
    async getCache(): Promise<{ businesses: Business[] }> {
        if (!this.cache) {
            await this.updateCache();
        }
        return this.cache;
    }
    cache: { businesses: Business[] } = undefined;

    async addRule(args: AddRuleArgs): Promise<void> {
        await businessPersistanceController.addRule(args);
        await this.updateCache();
    }
    async updateCache() {
        this.cache = { businesses: await businessPersistanceController.read({}) };
    }
    async delete(args: BusinessDeleteArgs): Promise<void> {
        await businessPersistanceController.delete(args);
        await this.updateCache();
    }
    async read(args: BusinessReadArgs): Promise<Business[]> {
        if (!args.businessId && !args.categoryId && !args.name) {
            if (!this.cache) {
                await this.updateCache();
            }
            return this.cache.businesses;
        }
        return businessPersistanceController.read(args);
    }
    async create(args: BusinessCreateArgs): Promise<string> {
        const businessId = await businessPersistanceController.create(args);
        await this.updateCache();
        return businessId;
    }
    async update(args: BusinessCreateArgs): Promise<void> {
        await businessPersistanceController.update(args);
        await this.updateCache();
    }
}

const businessesController = new BusinessesController();
export default businessesController;
