import { DashboardUpdateRequest } from "../api/models/DashboardDTO";
import { UserDashboardDTO, UserDashboardStackDTO } from "../api/models/UserDashboardDTO";
import { UserWidgetDTO } from "../api/models/UserWidgetDTO";

import { UserWidget } from "../models/UserWidget";

import { Dashboard, DashboardLayout, DashboardProps } from "../models/dashboard/Dashboard";
import { ExpandoPanel } from "../models/dashboard/ExpandoPanel";
import { FitPanel } from "../models/dashboard/FitPanel";
import { Stack } from "../models/dashboard/Stack";
import { TabbedPanel } from "../models/dashboard/TabbedPanel";
import { isExpandoPanelState, isTabbedPanelState, LayoutType, Panel, PanelState } from "../models/dashboard/types";

import { DashboardNode } from "../components/widget-dashboard/types";

import { userWidgetFromJson } from "./UserWidget.codec";

import { optional, values } from "../utility";

export interface UserState {
    dashboards: Dictionary<Dashboard>;
    stacks: NumericDictionary<Stack>;
    widgets: NumericDictionary<UserWidget>;
}

export interface PanelDTO {
    id: string;
    title: string;
    type: LayoutType;
    userWidgetIds: number[];
    activeWidgetId?: number;
    collapsed?: boolean[];
}

export interface DashboardLayoutDTO {
    tree: DashboardNode | null;
    panels: PanelDTO[];
}

export function deserializeUserState(dashboards: UserDashboardDTO[], userWidgets: UserWidgetDTO[]): UserState {
    return new UserStateDeserializer().deserialize(dashboards, userWidgets);
}

class UserStateDeserializer {
    private dashboards: Dictionary<Dashboard> = {};
    private stacks: NumericDictionary<Stack> = {};
    private widgets: NumericDictionary<UserWidget> = {};

    deserialize(dashboards: UserDashboardDTO[], userWidgets: UserWidgetDTO[]): UserState {
        userWidgets.forEach((userWidget) => this.addWidget(userWidget));

        dashboards.forEach((dashboard) => {
            this.addStack(dashboard.stack);
            this.addDashboard(dashboard);
        });

        return {
            dashboards: this.dashboards,
            stacks: this.stacks,
            widgets: this.widgets
        };
    }

    private addWidget(userWidget: UserWidgetDTO) {
        const _userWidget = userWidgetFromJson(userWidget);

        this.widgets[_userWidget.id] = _userWidget;
    }

    private addStack(stack: UserDashboardStackDTO) {
        if (stack.id in this.stacks) return;

        const _stack = new Stack({
            approved: stack.approved,
            dashboards: {},
            description: optional(stack.description),
            descriptorUrl: optional(stack.descriptorUrl),
            id: stack.id,
            imageUrl: optional(stack.imageUrl),
            name: stack.name,
            owner: optional(stack.owner),
            context: stack.stackContext
        });

        this.stacks[_stack.id] = _stack;
    }

    private addDashboard(dto: UserDashboardDTO) {
        const stack = this.stacks[dto.stack.id];
        if (stack === undefined) {
            throw new Error("No stack?");
        }

        const layout = JSON.parse(dto.layoutConfig) as DashboardLayoutDTO;

        const panels: Dictionary<Panel<any>> = {};
        for (const panel of layout.panels) {
            const _panel = this.createPanel(panel);
            panels[_panel.id] = _panel;
        }

        const props: DashboardProps = {
            description: optional(dto.description),
            guid: dto.guid,
            imageUrl: optional(dto.iconImageUrl),
            isAlteredByAdmin: dto.alteredByAdmin,
            isDefault: dto.isdefault,
            isGroupDashboard: dto.isGroupDashboard,
            isLocked: dto.locked,
            isMarkedForDeletion: dto.markedForDeletion,
            isPublishedToStore: dto.publishedToStore,
            name: dto.name,
            panels,
            position: dto.dashboardPosition,
            stackId: stack.id,
            tree: layout.tree,
            user: {
                username: dto.user.username
            }
        };

        const _dashboard = new Dashboard(props);

        this.dashboards[_dashboard.guid] = _dashboard;
        stack.dashboards[_dashboard.guid] = _dashboard;
    }

    private createPanel(dto: PanelDTO): Panel<PanelState> {
        const _widgets = dto.userWidgetIds.map((id) => this.widgets[id]);
        const _activeWidget = dto.activeWidgetId ? this.widgets[dto.activeWidgetId] : undefined;

        switch (dto.type) {
            case "fit":
                return new FitPanel(dto.id, dto.title, _widgets[0]);
            case "tabbed":
                return new TabbedPanel(dto.id, dto.title, _widgets, _activeWidget);
            case "accordion":
                return new ExpandoPanel("accordion", dto.id, dto.title, _widgets, dto.collapsed);
            case "portal":
                return new ExpandoPanel("portal", dto.id, dto.title, _widgets, dto.collapsed);
        }
    }
}

export function dashboardToUpdateRequest(dashboard: Dashboard): DashboardUpdateRequest {
    const state = dashboard.state().value;

    return {
        dashboardPosition: state.position,
        description: state.description,
        guid: state.guid,
        iconImageUrl: state.imageUrl,
        isdefault: state.isDefault,
        layoutConfig: JSON.stringify(dashboardLayoutToJson(state)),
        name: state.name
    };
}

export function dashboardLayoutToJson(state: DashboardLayout): DashboardLayoutDTO {
    return {
        tree: state.tree,
        panels: values(state.panels).map(panelToJson)
    };
}

export function panelToJson(panel: Panel<PanelState>): PanelDTO {
    if(panel.state$){
      let state = panel.state().value;
      return {
          id: state.id,
          title: state.title,
          type: state.type,
          userWidgetIds: state.widgets.map((widget) => widget.id),
          activeWidgetId: getActiveWidgetId(state),
          collapsed: isExpandoPanelState(state) ? state.collapsed : undefined
      };
    }else{
      // copy of dashboard has no state
      return {
          id: panel.id,
          title: panel.title,
          type: panel.type,
          userWidgetIds: panel.widgets.map((widget) => panel.id),
          activeWidgetId: getActiveWidgetId(panel),
          collapsed: isExpandoPanelState(panel) ? state.collapsed : undefined
      };
    }
}

function getActiveWidgetId(state: PanelState): number | undefined {
    return (isTabbedPanelState(state) || isExpandoPanelState(state)) && state.activeWidget !== null
        ? state.activeWidget.id
        : undefined;
}
