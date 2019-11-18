import { GroupDTO } from "./GroupDTO";
import { ProfileReference, UserDTO, UsernameDTO } from "./UserDTO";
import { createValidator } from "./validate";
import {
    STACK_GET_RESPONSE_SCHEMA,
    STACK_GROUP_GET_RESPONSE_SCHEMA,
    STACK_SCHEMA,
    STACK_USER_GET_RESPONSE_SCHEMA
} from "./schemas/stack.schema";
import { ListOf } from "../interfaces";

export interface StackDTO {
    id: number;
    name: string;
    approved: boolean;
    defaultGroup: GroupDTO;
    stackContext: string;
    description?: string;
    descriptorUrl?: string;
    groups: GroupDTO[];
    imageUrl?: string;
    owner?: UsernameDTO;
    totalWidgets?: number;
    totalGroups?: number;
    totalUsers?: number;
    totalDashboards?: number;
}

export interface StackUserResponse {
    stacks: StackDTO[];
    user: ProfileReference;
}

export interface StackGroupResponse {
    stack: StackDTO;
    group: GroupDTO;
}

export interface StackCreateRequest {
    name: string;
    approved?: boolean;
    imageUrl?: string;
    stackContext: string;
    descriptorUrl?: string;
    description?: string;
}

export interface StackUpdateRequest extends StackCreateRequest {
    id: number;
    update_action?: "add" | "remove";
    tab?: "users" | "groups";
    data?: UserDTO[] | GroupDTO[];
}

export const validateStackDetailResponse = createValidator<StackDTO>(STACK_SCHEMA);
export const validateStackListResponse = createValidator<ListOf<StackDTO[]>>(STACK_GET_RESPONSE_SCHEMA);
export const validateStackUserResponse = createValidator<StackUserResponse>(STACK_USER_GET_RESPONSE_SCHEMA);
export const validateStackGroupResponse = createValidator<StackGroupResponse>(STACK_GROUP_GET_RESPONSE_SCHEMA);
