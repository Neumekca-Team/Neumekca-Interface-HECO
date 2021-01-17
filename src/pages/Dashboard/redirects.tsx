import React from 'react'
import { Redirect, RouteComponentProps } from 'react-router-dom'

// Redirects to dashboard but only replace the pathname
export function RedirectPathToDashboardOnly({ location }: RouteComponentProps) {
  return <Redirect to={{ ...location, pathname: '/page/dashboard' }} />
}
