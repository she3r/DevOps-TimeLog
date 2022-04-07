import * as Core from 'azure-devops-extension-api/Core';
import * as API from 'azure-devops-extension-api/';
import * as SDK from 'azure-devops-extension-sdk';
import { CommonServiceIds, IProjectPageService } from 'azure-devops-extension-api';
import { ErrorHandler } from '../../helpers';
import { TeamMember } from 'azure-devops-extension-api/WebApi';
import { Member } from '../../interfaces';

export const GetProjectContext = async () => {
  return new Promise<API.IProjectInfo>((resolve, reject) =>
    SDK.getService<IProjectPageService>(CommonServiceIds.ProjectPageService)
      .then((result: IProjectPageService) => {
        result
          .getProject()
          .then((project) => {
            project ? resolve(project) : reject(ErrorHandler('GetProjectContextException'));
          })
          .catch(() => {
            reject(ErrorHandler('GetProjectContextException'));
          });
      })
      .catch(() => {
        reject(ErrorHandler('GetProjectContextException'));
      })
  );
};

export const coreRestClient = API.getClient(Core.CoreRestClient);

export const GetAllTeams = async () => {
  return new Promise<Core.WebApiTeam[]>((resolve, reject) =>
    coreRestClient
      .getAllTeams()
      .then((result: Core.WebApiTeam[]) => {
        resolve(result);
      })
      .catch(() => {
        reject(ErrorHandler('GetTeamsException'));
      })
  );
};

export const GetTeams = async (projectId?: string) => {
  const pId = projectId ?? (await GetProjectContext()).id;
  return new Promise<Core.WebApiTeam[]>((resolve, reject) =>
    coreRestClient
      .getTeams(pId)
      .then((result: Core.WebApiTeam[]) => {
        resolve(result);
      })
      .catch(() => {
        reject(ErrorHandler('GetTeamsException'));
      })
  );
};

export const GetTeamMembers = async (teamId: string, projectId?: string) => {
  const pId = projectId ?? (await GetProjectContext()).id;
  return new Promise<Member[]>((resolve, reject) =>
    coreRestClient
      .getTeamMembersWithExtendedProperties(pId, teamId)
      .then((result: TeamMember[]) => {
        let members: Member[] = [];
        members = result.map((item) => {
          const member: Member = { ...item.identity, isTeamAdmin: item.isTeamAdmin };
          return member;
        });
        resolve(members);
      })
      .catch(() => {
        reject(ErrorHandler('GetTeamsMembersException'));
      })
  );
};