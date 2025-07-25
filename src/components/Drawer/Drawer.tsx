import "./Drawer.css";

import { Drawer as Vaul } from "vaul";
import { useCallback, useEffect, useState } from "react";
import type { FC, ReactNode } from "react";

type DrawerProps = {
  title?: string;
  description?: string;
  children?: ReactNode;
  open?: boolean;
};

export const Drawer: FC<DrawerProps> = (props) => {
  const { children } = props;
  const [open, setOpen] = useState(props.open);

  const onOpenChange = useCallback(() => {
    setOpen(undefined);
  }, []);

  useEffect(() => {
    setOpen(props.open);
  }, [props.open]);

  return (
    <Vaul.Root open={open} onOpenChange={onOpenChange}>
      <Vaul.Portal>
        <Vaul.Title>Drawer Title</Vaul.Title>
        <Vaul.Description>Drawer Description</Vaul.Description>
        <Vaul.Overlay className="drawer-overlay" />
        <Vaul.Content className="drawer-content">
          <Vaul.Handle className="drawer-handle" />
          <div className="drawer-children">{children}</div>
        </Vaul.Content>
      </Vaul.Portal>
    </Vaul.Root>
  );
};
