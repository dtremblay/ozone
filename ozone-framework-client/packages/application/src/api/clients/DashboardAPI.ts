import * as qs from "qs";
import { Gateway, getGateway, Response } from "../interfaces";

import {
    DashboardDTO,
    DashboardGetResponse,
    DashboardUpdateParams,
    DashboardUpdateRequest,
    DashboardUpdateResponse
} from "../models/DashboardDTO";

import { isNil } from "lodash";

export class DashboardAPI {
    private readonly gateway: Gateway;

    constructor(gateway?: Gateway) {
        this.gateway = gateway || getGateway();
    }

    async getDashboards(): Promise<Response<DashboardGetResponse>> {
        return this.gateway.get("dashboard/", {
            validate: DashboardGetResponse.validate
        });
    }

    async createDashboard(
        data: DashboardUpdateRequest,
        options?: DashboardUpdateParams
    ): Promise<Response<DashboardUpdateResponse>> {
        const requestData = buildDashboardUpdateRequest(data, options);

        return this.gateway.post(`dashboard/`, requestData, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            validate: DashboardUpdateResponse.validate
        });
    }

    async updateDashboard(
        data: DashboardUpdateRequest,
        options?: DashboardUpdateParams
    ): Promise<Response<DashboardUpdateResponse>> {
        const requestData = buildDashboardUpdateRequest(data, options);

        return this.gateway.put(`dashboard/${data.guid}/`, requestData, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            validate: DashboardUpdateResponse.validate
        });
    }

    async deleteDashboard(guid: string): Promise<Response<DashboardDTO>> {
        const requestData = qs.stringify({
            data: JSON.stringify({ guid })
        });

        return this.gateway.delete(`dashboard/${guid}/`, requestData, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            validate: DashboardDTO.validate
        });
    }
}

export const dashboardApi = new DashboardAPI();

function buildDashboardUpdateRequest(data: DashboardUpdateRequest, options?: DashboardUpdateParams): string {
    const request: any = {
        data: JSON.stringify([data])
    };

    if (options && !isNil(options.adminEnabled)) {
        request.adminEnabled = options.adminEnabled;
    }

    if (options && !isNil(options.isGroupDashboard)) {
        request.isGroupDashboard = options.isGroupDashboard;
    }

    if (options && !isNil(options.user_id)) {
        request.user_id = options.user_id;
    }

    return qs.stringify(request);
}