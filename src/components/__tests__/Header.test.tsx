import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from '../Header';
import { VIEW } from '../../context';

// Mock the context
jest.mock('../../context', () => ({
  VIEW: {
    context: jest.fn(() => ({
      state: { id: 'test-id' }
    }))
  }
}));

describe('Header', () => {
  const mockToggleStats = jest.fn();
  const defaultProps = {
    stats: false,
    toggleStats: mockToggleStats
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the title correctly', () => {
    render(<Header {...defaultProps} />);
    
    expect(screen.getByText('World Generator')).toBeInTheDocument();
  });

  it('displays the state ID when available', () => {
    render(<Header {...defaultProps} />);
    
    expect(screen.getByText('test-id')).toBeInTheDocument();
  });

  it('shows "stats" button when stats is false', () => {
    render(<Header {...defaultProps} />);
    
    expect(screen.getByText('stats')).toBeInTheDocument();
  });

  it('shows "world" button when stats is true', () => {
    render(<Header {...defaultProps} stats={true} />);
    
    expect(screen.getByText('world')).toBeInTheDocument();
  });

  it('calls toggleStats when button is clicked', () => {
    render(<Header {...defaultProps} />);
    
    const button = screen.getByText('stats');
    fireEvent.click(button);
    
    expect(mockToggleStats).toHaveBeenCalledWith(true);
  });
}); 