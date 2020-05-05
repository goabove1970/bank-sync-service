import { DeepPartial } from '@models/DeepPartial';
import {
  matchesReadArgs,
  combineNewBusiness,
  validateCreateBusinessArgs,
  toShortBusinessDetails,
  validateBusinessUpdateArgs,
  validateAddRuleArgs,
} from './helper';
import { DatabaseController } from '../DataController';
import { DatabaseError } from '@root/src/models/errors/errors';
import { BusinessPersistanceControllerBase } from './BusinessPersistanceControllerBase';
import { Business } from '@root/src/models/business/business';
import { BusinessReadArgs } from '@root/src/models/business/BusinessReadArgs';
import { BusinessCreateArgs } from '@root/src/models/business/BusinessCreateArgs';
import { BusinessUpdateArgs } from '@root/src/models/business/BusinessUpdateArgs';
import { BusinessDeleteArgs } from '@root/src/models/business/BusinessDeleteArgs';
import { businessPostgresDataController } from './BusinessPostgresController';
import { AddRuleArgs } from '@root/src/models/business/AddRuleArgs';

export class BusinessPersistanceController implements BusinessPersistanceControllerBase {
  private dataController: DatabaseController<Business>;

  constructor(controller: DatabaseController<Business>) {
    this.dataController = controller;
  }

  private findBusinessImpl(businessId: string): Promise<Business | undefined> {
    return this.dataController
      .select(`WHERE business_id='${businessId}'`)
      .then((c) => {
        {
          return c && c.length > 0 ? c[0] : undefined;
        }
      })
      .catch((error) => {
        throw error;
      });
  }

  read(args: BusinessReadArgs): Promise<DeepPartial<Business>[]> {
    return this.dataController
      .select(matchesReadArgs(args))
      .then((c) => c.map(toShortBusinessDetails))
      .catch((error) => {
        throw error;
      });
  }

  create(args: BusinessCreateArgs): Promise<string> {
    const a = combineNewBusiness(args);
    return validateCreateBusinessArgs(args)
      .then(() => {
        return this.dataController.insert(`
                (
                    business_id, name, default_category_id, regexps)
                    VALUES (
                        '${a.businessId}', 
                        ${a.name ? "'" + a.name + "'" : 'NULL'},
                        ${a.defaultCategoryId ? "'" + a.defaultCategoryId + "'" : 'NULL'},
                        ${a.regexps ? "'" + a.regexps.join('||') + "'" : 'NULL'});`);
      })
      .then(() => {
        return a.businessId;
      })
      .catch((error) => {
        throw error;
      });
  }

  update(args: BusinessUpdateArgs): Promise<void> {
    return validateBusinessUpdateArgs(args)
      .then(() => {
        return this.findBusinessImpl(args.businessId);
      })
      .then((business) => {
        if (!business) {
          throw new DatabaseError('Error updating business data, could not find business record');
        }
        return business;
      })
      .then((business) => {
        if (args.categoryId) {
          business.defaultCategoryId = args.categoryId;
        }
        if (args.name) {
          business.name = args.name;
        }
        if (args.regexps) {
          business.regexps = args.regexps;
        }
        return business;
      })
      .then((account) => {
        this.dataController.update(this.composeSetStatement(account));
      })
      .catch((error) => {
        throw error;
      });
  }
  addRule(args: AddRuleArgs): Promise<void> {
    validateAddRuleArgs(args);
    return this.findBusinessImpl(args.businessId)
      .then((business) => {
        if (!business) {
          throw new DatabaseError('Error updating business data, could not find business record');
        }
        return business;
      })
      .then((business) => {
        if (args.rule) {
          if (business.regexps) {
            business.regexps.push(args.rule);
          } else {
            business.regexps = [args.rule];
          }
        }
        business.regexps = business.regexps.filter((r) => r != '');
        business.regexps = [...new Set(business.regexps)];
        return business;
      })
      .then((business) => {
        this.dataController.update(this.composeSetStatement(business));
      })
      .catch((error) => {
        throw error;
      });
  }

  private composeSetStatement(a: Business): string {
    return `
        SET
            name=${a.name ? "'" + a.name + "'" : 'NULL'},
            default_category_id=${a.defaultCategoryId ? "'" + a.defaultCategoryId + "'" : 'NULL'},
            regexps=${a.regexps ? "'" + a.regexps.join('||') + "'" : 'NULL'}
        WHERE
            business_id='${a.businessId}';`;
  }

  delete(args: BusinessDeleteArgs): Promise<void> {
    const { businessId } = args;
    return this.findBusinessImpl(businessId)
      .then((a) => {
        if (!a) {
          throw new DatabaseError('Error deleting business, could not find business record');
        }
        return this.dataController.delete(`where "business_id"='${businessId}'`).then(() => {});
      })
      .catch((error) => {
        throw error;
      });
  }
}

export const businessPersistanceController = new BusinessPersistanceController(businessPostgresDataController);
