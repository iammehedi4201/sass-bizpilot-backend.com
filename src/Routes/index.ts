import { Authroutes } from "@/Modules/Auth/Auth.route";
import { BizpilotUserRoutes } from "@/Modules/BizpilotUser/BizpilotUser.route";
import { ModeratorRoutes } from "@/Modules/Moderator/Moderator.route";
import { OrganizationRoutes } from "@/Modules/Organization/Organization.route";
import { OrganizationMemberRoutes } from "@/Modules/Organization/OrganizationMember.route";
import { UserRoutes } from "@/Modules/User/User.route";
import { Router } from "express";

const routes = Router();

export const moduleRoute = [
  {
    path: "/auth",
    route: Authroutes,
  },
  {
    path: "/users",
    route: UserRoutes,
  },
  {
    path: "/moderators",
    route: ModeratorRoutes,
  },
  {
    path: "/organizations",
    route: OrganizationRoutes,
  },
  {
    path: "/organization-members",
    route: OrganizationMemberRoutes,
  },
  {
    path: "/bizpilot-users",
    route: BizpilotUserRoutes,
  },
];

moduleRoute.forEach((Route) => routes.use(Route.path, Route.route));

export default routes;
