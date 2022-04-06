import React, { useEffect, useState } from 'react';
import { MainWrapperComponent, SelectField, TextFieldComponent } from 'techsbcn-storybook';
import { _VALUES } from '../../resources/_constants/values';
import { GetTeams, GetTeamMembers } from '../../redux/core/coreAPI';
import { SelectAsyncHelper } from '../../helpers';
import * as SDK from 'azure-devops-extension-sdk';
import * as _ from 'lodash';

interface TimeLogFiltersProps {
  onFiltersChange: (value: any, name: string) => void;
  user?: SDK.IUserContext;
  loading: boolean;
}

const TimeLogFilters: React.FC<TimeLogFiltersProps> = (props) => {
  const [teams, setTeams] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [teamSelected, setTeamSelected] = useState<any>();
  const [memberSelected, setMemberSelected] = useState<any[]>();

  useEffect(() => {
    GetTeams().then((result) => {
      const resultTransform = SelectAsyncHelper(result);
      setTeams(resultTransform);
      setTeamSelected(resultTransform[0]);
    });
  }, []);

  const loadMembers = React.useCallback(() => {
    if (teamSelected) {
      GetTeamMembers(teamSelected.value).then((members) => {
        setMembers(members);
        props.user && members.some((member) => props.user && member.id === props.user.id)
          ? setMemberSelected([{ value: props.user.id, label: props.user.displayName }])
          : setMemberSelected([{ value: 'all', label: _VALUES.ALL }]);
      });
    }
  }, [props.user, teamSelected]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const ListFilters = () => {
    const filterList: any[] = [];
    const allOption = { value: 'all', label: _VALUES.ALL };
    teams &&
      teams?.length > 0 &&
      filterList.push({
        singleFilter: (
          <SelectField
            name="teams"
            label={_VALUES.TEAMS}
            options={teams}
            value={teamSelected && teamSelected}
            isClearable={false}
            onChangeOption={(options) => {
              setTeamSelected(options);
            }}
          />
        ),
      });

    members &&
      members?.length > 0 &&
      filterList.push({
        singleFilter: (
          <SelectField
            name="userIds"
            label={_VALUES.USERS}
            options={members && members?.length > 0 ? SelectAsyncHelper(members) : []}
            addExtraOption={allOption}
            value={memberSelected}
            isClearable={false}
            isMulti
            onChangeOption={(value) => {
              if (value.length > 0) {
                const name = 'userIds';
                if (
                  memberSelected &&
                  memberSelected.some((option: any) => option.value === 'all') &&
                  value.some((option: any) => option.value === 'all')
                ) {
                  const result = value.filter((option: any) => option.value !== 'all');
                  setMemberSelected(result);
                  props.onFiltersChange(
                    result.map((item: any) => item.value),
                    name
                  );
                } else if (Array.isArray(value) && value.some((option: any) => option.value === 'all')) {
                  props.onFiltersChange([], name);
                  setMemberSelected([allOption]);
                } else {
                  props.onFiltersChange(
                    value.map((item: any) => item.value),
                    name
                  );
                  setMemberSelected(value);
                }
              }
            }}
          />
        ),
      });

    filterList.push({
      doubleFilter: {
        firstFilter: (
          <TextFieldComponent
            label={_VALUES.FROM}
            name="timeFrom"
            type="date"
            onChange={_.debounce(async (e) => props.onFiltersChange(e.target.value, e.target.name), 1000)}
          />
        ),
        secondFilter: (
          <TextFieldComponent
            label={_VALUES.TO}
            name="timeTo"
            type="date"
            onChange={_.debounce(async (e) => {
              const date = new Date(new Date(e.target.value).setHours(23, 59, 59));
              props.onFiltersChange(
                !isNaN(date.valueOf()) ? date.toLocaleString('sv-SE') : e.target.value,
                e.target.name
              );
            }, 1000)}
          />
        ),
      },
    });

    return filterList;
  };

  return (
    <MainWrapperComponent
      headerProps={{
        title: _VALUES.FILTERS,
        filters: !props.loading ? ListFilters() : [],
      }}
      loading={props.loading}
    />
  );
};

export default TimeLogFilters;
