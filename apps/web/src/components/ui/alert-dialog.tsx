import type { VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";
import { Button, type buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AlertDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

interface AlertDialogContentProps {
  children: ReactNode;
  className?: string;
}

interface AlertDialogHeaderProps {
  children: ReactNode;
  className?: string;
}

interface AlertDialogTitleProps {
  children: ReactNode;
  className?: string;
}

interface AlertDialogDescriptionProps {
  children: ReactNode;
  className?: string;
}

interface AlertDialogActionProps extends VariantProps<typeof buttonVariants> {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

interface AlertDialogCancelProps {
  children?: ReactNode;
  onClick?: () => void;
  className?: string;
}

function AlertDialog({ open, onOpenChange, children }: AlertDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      {children}
    </Dialog>
  );
}

function AlertDialogContent({ children, className }: AlertDialogContentProps) {
  return <DialogContent className={className}>{children}</DialogContent>;
}

function AlertDialogHeader({ children, className }: AlertDialogHeaderProps) {
  return <DialogHeader className={className}>{children}</DialogHeader>;
}

function AlertDialogTitle({ children, className }: AlertDialogTitleProps) {
  return <DialogTitle className={className}>{children}</DialogTitle>;
}

function AlertDialogDescription({ children, className }: AlertDialogDescriptionProps) {
  return <DialogDescription className={className}>{children}</DialogDescription>;
}

function AlertDialogAction({
  children,
  onClick,
  disabled,
  className,
  variant,
  size,
}: AlertDialogActionProps) {
  return (
    <Button
      className={className}
      disabled={disabled}
      onClick={onClick}
      size={size}
      variant={variant}
    >
      {children}
    </Button>
  );
}

function AlertDialogCancel({ children = "Cancel", onClick, className }: AlertDialogCancelProps) {
  return (
    <Button className={className} onClick={onClick} variant="outline">
      {children}
    </Button>
  );
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
};
