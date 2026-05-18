import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import { type ReactNode } from 'react';
import { X } from 'lucide-react';
import { Typography } from './Typography';
import { cn } from '@shared/utils/cn';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[95vw]',
};

/**
 * MUI-backed modal wrapper.
 *
 * App code depends on this stable wrapper, not on MUI's Dialog API directly.
 */
export function Modal({ isOpen, onClose, title, children, size = 'md', className }: ModalProps) {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      aria-labelledby={title ? 'modal-title' : undefined}
      maxWidth={false}
      slotProps={{
        paper: {
          className: cn('w-full border border-border bg-surface', sizeClasses[size], className),
        },
      }}
    >
      <Box className="flex items-center justify-between border-b border-border p-6">
        {title && (
          <Typography id="modal-title" level="h3">
            {title}
          </Typography>
        )}
        <IconButton
          onClick={onClose}
          aria-label="Close modal"
          className="ml-auto text-text-primary hover:bg-muted"
          size="small"
        >
          <X className="h-4 w-4" />
        </IconButton>
      </Box>

      <DialogContent className="p-6">{children}</DialogContent>
    </Dialog>
  );
}
