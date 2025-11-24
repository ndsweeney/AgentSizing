import customers from '../data/customers.json';
import products from '../data/products.json';
import quotes from '../data/quotes.json';
import tickets from '../data/tickets.json';

export interface DatasetMetadata {
  id: string;
  name: string;
  description: string;
  data: any[];
  filename: string;
}

export const datasets: DatasetMetadata[] = [
  {
    id: 'customers',
    name: 'Customers',
    description: 'Sample customer records with segmentation and status.',
    data: customers,
    filename: 'customers.json'
  },
  {
    id: 'products',
    name: 'Products',
    description: 'Product catalog with pricing and stock levels.',
    data: products,
    filename: 'products.json'
  },
  {
    id: 'quotes',
    name: 'Quotes',
    description: 'Sales quotes linked to customers.',
    data: quotes,
    filename: 'quotes.json'
  },
  {
    id: 'tickets',
    name: 'Support Tickets',
    description: 'Service requests and incidents.',
    data: tickets,
    filename: 'tickets.json'
  }
];
