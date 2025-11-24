
export interface ConnectorSchema {
  name: string;
  description: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  endpoint: string;
  requestSchema?: object;
  responseSchema: object;
}

export interface ConnectorDefinition {
  id: string;
  name: string;
  provider: string;
  description: string;
  icon?: string; // Lucide icon name or similar
  schemas: ConnectorSchema[];
}

export const CONNECTORS: Record<string, ConnectorDefinition> = {
  'd365-sales': {
    id: 'd365-sales',
    name: 'Dynamics 365 Sales',
    provider: 'Microsoft',
    description: 'Connect to Dynamics 365 Sales to manage leads, opportunities, and accounts.',
    schemas: [
      {
        name: 'Get Account',
        description: 'Retrieve account details by ID',
        method: 'GET',
        endpoint: '/api/data/v9.2/accounts({accountid})',
        responseSchema: {
          name: 'string',
          accountnumber: 'string',
          emailaddress1: 'string',
          telephone1: 'string',
          address1_city: 'string'
        }
      },
      {
        name: 'Create Lead',
        description: 'Create a new sales lead',
        method: 'POST',
        endpoint: '/api/data/v9.2/leads',
        requestSchema: {
          subject: 'string',
          firstname: 'string',
          lastname: 'string',
          companyname: 'string',
          emailaddress1: 'string'
        },
        responseSchema: {
          leadid: 'guid',
          subject: 'string'
        }
      }
    ]
  },
  'sap-s4hana': {
    id: 'sap-s4hana',
    name: 'SAP S/4HANA Cloud',
    provider: 'SAP',
    description: 'Access SAP S/4HANA Cloud for ERP data including orders and inventory.',
    schemas: [
      {
        name: 'Get Sales Order',
        description: 'Fetch sales order details',
        method: 'GET',
        endpoint: '/sap/opu/odata/sap/API_SALES_ORDER_SRV/A_SalesOrder(\'{SalesOrder}\')',
        responseSchema: {
          SalesOrder: 'string',
          SalesOrderType: 'string',
          SalesOrganization: 'string',
          DistributionChannel: 'string',
          TotalNetAmount: 'decimal'
        }
      },
      {
        name: 'Check Inventory',
        description: 'Check material availability',
        method: 'GET',
        endpoint: '/sap/opu/odata/sap/API_PRODUCT_SRV/A_ProductPlant',
        responseSchema: {
          Product: 'string',
          Plant: 'string',
          AvailableStock: 'decimal'
        }
      }
    ]
  },
  'servicenow': {
    id: 'servicenow',
    name: 'ServiceNow ITSM',
    provider: 'ServiceNow',
    description: 'Manage IT incidents and service requests.',
    schemas: [
      {
        name: 'Create Incident',
        description: 'Log a new IT incident',
        method: 'POST',
        endpoint: '/api/now/table/incident',
        requestSchema: {
          short_description: 'string',
          urgency: 'integer',
          impact: 'integer',
          comments: 'string'
        },
        responseSchema: {
          result: {
            sys_id: 'string',
            number: 'string',
            state: 'string'
          }
        }
      },
      {
        name: 'Get Ticket Status',
        description: 'Check status of an existing ticket',
        method: 'GET',
        endpoint: '/api/now/table/incident/{sys_id}',
        responseSchema: {
          result: {
            number: 'string',
            state: 'string',
            assigned_to: 'string'
          }
        }
      }
    ]
  },
  'sharepoint': {
    id: 'sharepoint',
    name: 'SharePoint Online',
    provider: 'Microsoft',
    description: 'Access lists and documents in SharePoint Online.',
    schemas: [
      {
        name: 'Get List Items',
        description: 'Retrieve items from a SharePoint list',
        method: 'GET',
        endpoint: '/_api/web/lists/getbytitle(\'{Title}\')/items',
        responseSchema: {
          value: [
            {
              Id: 'integer',
              Title: 'string',
              Created: 'datetime'
            }
          ]
        }
      }
    ]
  },
  'sql-server': {
    id: 'sql-server',
    name: 'SQL Server',
    provider: 'Microsoft',
    description: 'Execute queries and stored procedures on SQL Server.',
    schemas: [
      {
        name: 'Execute Stored Procedure',
        description: 'Run a stored procedure with parameters',
        method: 'POST',
        endpoint: '/v2/datasets/{server}/procedures/{procedure}',
        requestSchema: {
          params: 'object'
        },
        responseSchema: {
          resultSets: 'array'
        }
      }
    ]
  },
  'generic-http': {
    id: 'generic-http',
    name: 'HTTP Request',
    provider: 'Generic',
    description: 'Make a generic HTTP request to any REST API.',
    schemas: [
      {
        name: 'GET Request',
        description: 'Standard GET request',
        method: 'GET',
        endpoint: '{url}',
        responseSchema: {
          data: 'any'
        }
      }
    ]
  }
};

export function getConnectorsForSystem(systemName: string): ConnectorDefinition | null {
  const normalized = systemName.toLowerCase();
  if (normalized.includes('dynamics') || normalized.includes('d365') || normalized.includes('crm')) {
    return CONNECTORS['d365-sales'];
  }
  if (normalized.includes('sap') || normalized.includes('hana')) {
    return CONNECTORS['sap-s4hana'];
  }
  if (normalized.includes('servicenow') || normalized.includes('snow')) {
    return CONNECTORS['servicenow'];
  }
  if (normalized.includes('sharepoint') || normalized.includes('spo')) {
    return CONNECTORS['sharepoint'];
  }
  if (normalized.includes('sql') || normalized.includes('db')) {
    return CONNECTORS['sql-server'];
  }
  return CONNECTORS['generic-http'];
}

export function getAllConnectors(): ConnectorDefinition[] {
  return Object.values(CONNECTORS);
}
