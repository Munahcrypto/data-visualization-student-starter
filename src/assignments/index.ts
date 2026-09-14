import type { ComponentType } from 'react';
import { ResponsivePseudoScatterPlot } from './week-01/ResponsivePseudoScatterPlot';
import { Week02 } from './week-02';
import { Week03 } from './week-03';
import { Week04 } from './week-04';

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
];

export const assignmentsMap = new Map(
  assignments.map((ex) => [ex.id, ex]),
);

export const defaultAssignment = '1';
