import '../../../i18n/config';
import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination } from '../Pagination';

describe('Pagination', () => {
  it('renders nothing when there is only one page', () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} onPageChange={vi.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when there are no pages', () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={0} onPageChange={vi.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders page number buttons and marks the current page', () => {
    render(<Pagination currentPage={2} totalPages={4} onPageChange={vi.fn()} />);
    [1, 2, 3, 4].forEach((page) => {
      expect(screen.getByRole('button', { name: `Page ${page}` })).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Page 1' })).not.toHaveAttribute('aria-current');
  });

  it('collapses distant pages into an ellipsis', () => {
    render(<Pagination currentPage={1} totalPages={9} onPageChange={vi.fn()} />);
    expect(screen.getByLabelText('More pages')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Page 5' })).not.toBeInTheDocument();
  });

  it('calls onPageChange with the clicked page number', () => {
    const onPageChange = vi.fn();
    render(<Pagination currentPage={2} totalPages={4} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Page 3' }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('disables Previous on the first page and Next on the last page', () => {
    render(<Pagination currentPage={1} totalPages={3} onPageChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next page' })).not.toBeDisabled();
  });

  it('calls onPageChange with the adjacent page when Previous/Next are clicked', () => {
    const onPageChange = vi.fn();
    render(<Pagination currentPage={2} totalPages={3} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Previous page' }));
    expect(onPageChange).toHaveBeenCalledWith(1);
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });
});
