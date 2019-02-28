import "reflect-metadata";

import { SystemConfigAPI } from "../../src/api/clients/SystemConfigAPI";

import { NodeGateway } from "./node-gateway";

describe("AppConfig API", () => {
    let gateway: NodeGateway;
    let configApi: SystemConfigAPI;

    beforeAll(async () => {
        gateway = new NodeGateway();
        configApi = new SystemConfigAPI(gateway);

        await gateway.login("testAdmin1", "password");
        expect(gateway.isAuthenticated).toEqual(true);
    });

    test("getConfigs - GET /applicationConfiguration/configs/", async () => {
        const response = await configApi.getConfigs();

        expect(response.status).toEqual(200);

        expect(response.data).toHaveLength(20);
        expect(response.data[0]).toEqual({
            id: 1,
            code: "owf.enable.cef.logging",
            value: "false",
            type: "Boolean",
            title: "Common Event Format (CEF) Auditing",
            description: "Record when users sign in/out, create, edit, delete, search, import and export.",
            help: "",
            mutable: true,
            groupName: "AUDITING",
            subGroupName: null,
            subGroupOrder: 1
        });
    });

    test("updateConfig - PUT /applicationConfiguration/configs/", async () => {
        const response = await configApi.updateConfig({ id: 1, value: "true" });

        expect(response.status).toEqual(200);
        expect(response.data).toEqual({
            id: 1,
            code: "owf.enable.cef.logging",
            value: "true",
            type: "Boolean",
            title: "Common Event Format (CEF) Auditing",
            description: "Record when users sign in/out, create, edit, delete, search, import and export.",
            help: "",
            mutable: true,
            groupName: "AUDITING",
            subGroupName: null,
            subGroupOrder: 1
        });

        // Cleanup
        await configApi.updateConfig({ id: 1, value: "false" });
    });
});
