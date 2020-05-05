import { Router } from 'express';

import { BusinessError } from '@models/errors/errors';
import controller from '@src/controllers/business-controller';
import { BusinessRequest, BusinessResponse, BusinessRequestType } from './request-types/BusinessRequests';
import { BusinessReadArgs } from '../models/business/BusinessReadArgs';
import { BusinessCreateArgs } from '../models/business/BusinessCreateArgs';
import { BusinessDeleteArgs } from '../models/business/BusinessDeleteArgs';
import { AddRuleArgs } from '../models/business/AddRuleArgs';

const router = Router();

const process = async function(req, res, next) {
    // console.log(`Received a request in category controller: ${JSON.stringify(req.body, null, 4)}`);
    const request = req.body as BusinessRequest;
    if (!request) {
        return res.status(500).send(new BusinessError('Empty business request'));
    }

    let responseData: BusinessResponse = {};

    console.log(`Processing ${request.action} business request`);
    switch (request.action) {
        case BusinessRequestType.Create:
            responseData = await processCreateBusinessRequest(request.args);
            break;
        case BusinessRequestType.Update:
            responseData = await processUpdateBusinessRequest(request.args);
            break;
        case BusinessRequestType.Delete:
            responseData = await processDeleteBusinessRequest(request.args);
            break;
        case BusinessRequestType.Read:
            responseData = await processReadBusinessRequest(request.args);
            break;
        case BusinessRequestType.AddRule:
            responseData = await processAddRuleRequest(request.args);
            break;
        default:
            const enumKeys = [];
            for (var enumMember in BusinessRequestType) {
                enumKeys.push(BusinessRequestType[enumMember]);
            }

            const availableRequestTypes = enumKeys.join(', ');
            return res
                .status(500)
                .send(
                    new BusinessError(
                        `Unknown business request type: ${request.action}, try [${availableRequestTypes}]`
                    )
                );
    }

    res.send(responseData);
};

router.get('/', process);
router.post('/', process);

async function processReadBusinessRequest(request: BusinessReadArgs): Promise<BusinessResponse> {
    const response: BusinessResponse = {
        action: BusinessRequestType.Read,
        payload: {},
    };

    try {
        return await controller
            .read(request)
            .then((collection) => {
                response.payload = {
                    count: collection.length,
                    businesses: collection,
                };
                return response;
            })
            .catch((error) => {
                throw error;
            });
    } catch (error) {
        console.error(error.message);
        response.error = error.message;
    }
    return response;
}

async function processCreateBusinessRequest(request: BusinessCreateArgs): Promise<BusinessResponse> {
    const response: BusinessResponse = {
        action: BusinessRequestType.Create,
        payload: {},
    };

    try {
        return await controller
            .create(request)
            .then((busiessId) => {
                response.payload = {
                    busiessId,
                };
                return response;
            })
            .catch((error) => {
                throw error;
            });
    } catch (error) {
        console.error(error.message);
        response.error = error.message;
    }
    return response;
}

async function processDeleteBusinessRequest(request: BusinessDeleteArgs): Promise<BusinessResponse> {
    const response: BusinessResponse = {
        action: BusinessRequestType.Delete,
        payload: {},
    };

    try {
        return await controller
            .delete(request)
            .then(() => {
                response.payload = {
                    busiessId: request.businessId,
                };
                return response;
            })
            .catch((error) => {
                throw error;
            });
    } catch (error) {
        console.error(error.message);
        response.error = error.message;
    }
    return response;
}

async function processUpdateBusinessRequest(request: BusinessReadArgs): Promise<BusinessResponse> {
    const response: BusinessResponse = {
        action: BusinessRequestType.Update,
        payload: {},
    };

    try {
        return await controller
            .update(request)
            .then(() => {
                response.payload = {
                    busiessId: request.businessId,
                };
                return response;
            })
            .catch((error) => {
                throw error;
            });
    } catch (error) {
        console.error(error.message);
        response.error = error.message;
    }
    return response;
}

async function processAddRuleRequest(request: AddRuleArgs): Promise<BusinessResponse> {
    const response: BusinessResponse = {
        action: BusinessRequestType.AddRule,
        payload: {},
    };

    try {
        return await controller
            .addRule(request)
            .then(() => {
                response.payload = {
                    busiessId: request.businessId,
                };
                return response;
            })
            .catch((error) => {
                throw error;
            });
    } catch (error) {
        console.error(error.message);
        response.error = error.message;
    }
    return response;
}

export = router;
