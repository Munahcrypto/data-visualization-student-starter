
import type { ComponentType } from 'react';

import { ResponsivePseudoScatterPlot } from './week-01/ResponsivePseudoScatterPlot';
import { Week02 } from './week-02';
import { Week03 } from './week-03';
import { Week04 } from './week-04';
import { Week05 } from './week-05';
import { Week06 } from './week-06';
import { Week07 } from './week-07';
import { Week08 } from './week-08';
import { Week10 } from './week-10';

export interface Assignment {
  id: string;
  name: string;
  component: ComponentType;
}

export const assignments: Assignment[] = [
  {
    id: '1',
    name: 'Week 1',
    component: ResponsivePseudoScatterPlot,
  },
  {
    id: '2',
    name: 'Week 2',
    component: Week02,
  },
  {
    id: '3',
    name: 'Week 3',
    component: Week03,
  },
  {
    id: '4',
    name: 'Week 4',
    component: Week04,
  },
  {
    id: '5',
    name: 'Week 5',
    component: Week05,
  },
  {
    id: '6',
    name: 'Week 6',
    component: Week06,
  },
  {
    id: '7',
    name: 'Week 7',
    component: Week07,
  },
  {
    id: '8',
    name: 'Week 8',
    component: Week08,
  },
  {
    id: '10',
    name: 'Week 10',
    component: Week10,
  },
];

export const assignmentsMap = new Map(
  assignments.map((assignment) => [
    assignment.id,
    assignment,
  ])
);

export const defaultAssignment = assignments[0];
