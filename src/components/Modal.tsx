import React, { FC, ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../UI/dialog";

interface ModalPropsType {
  children: ReactNode;
  isOpen?: boolean;
  setIsOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  title?: string;
  footer?: ReactNode[];
  width?: number;
  padding?: number;
  onClose?: () => void;
  className?: string;
}

const Modal: FC<ModalPropsType> = ({
  children,
  isOpen,
  setIsOpen,
  title,
  footer = [],
  padding = "1.5rem",
  onClose,
  className,
}) => {
  const handleOnClose = (): void => {
    if (!!onClose) {
      onClose();
    } else if (setIsOpen) {
      setIsOpen(false);
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        style={{ padding }}
        className={`${className} border-none rounded-xl  w-[940px]`}
        onClick={handleOnClose}
      >
        {!!title && (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
        )}
        {children}
        {footer.length > 0 && (
          <DialogFooter>
            {footer.map((item, index) => (
              <React.Fragment key={index}>{item}</React.Fragment>
            ))}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default Modal;
