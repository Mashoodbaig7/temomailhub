import { render, screen } from '@testing-library/react';
import App from './App';

test('renders home page by default', () => {
  render(<App />);
  const homeElement = screen.getByText(/Secure Temporary Email Service/i);
  expect(homeElement).toBeInTheDocument();
});

test('renders pricing page when pricing link is clicked', () => {
  render(<App />);
  const pricingLink = screen.getByText(/Pricing/i);
  pricingLink.click();
  const pricingElement = screen.getByText(/Choose Your Perfect Plan/i);
  expect(pricingElement).toBeInTheDocument();
});

test('renders about us page when about link is clicked', () => {
  render(<App />);
  const aboutLink = screen.getByText(/About/i);
  aboutLink.click();
  const aboutElement = screen.getByText(/An innovative product by D-Tech Studios/i);
  expect(aboutElement).toBeInTheDocument();
});

test('renders contact page when contact link is clicked', () => {
  render(<App />);
  const contactLink = screen.getByText(/Contact/i);
  contactLink.click();
  const contactElement = screen.getByText(/We welcome any questions, technical inquiries, bug reports, suggestions, or other issues you may have. Please feel free to contact us./i);
  expect(contactElement).toBeInTheDocument();
});