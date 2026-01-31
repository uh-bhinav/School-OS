import React from 'react';
import { RouteObject } from 'react-router-dom';
import { FrontOfficeShell }  from '../../components/FrontOfficeShell';
import GatePassManagement from '../../pages/GatePassManagement';

const gatePassRoutes: RouteObject[] = [
  {
    path: '/frontoffice',
    element: <FrontOfficeShell />, // Wrap the routes in the FrontOffice shell
    children: [
      {
        path: 'gate-pass-management',
        element: <GatePassManagement />,
      },
    ],
  },
];

export default gatePassRoutes;
