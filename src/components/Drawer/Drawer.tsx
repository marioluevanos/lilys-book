import "./Drawer.css";

import { Drawer as Vaul } from "vaul";
import { useCallback, useEffect, useState } from "react";
import type { FC, ReactNode } from "react";
import { EventPayload, events } from "../../events";

type DrawerProps = {
  title?: string;
  description?: string;
};

export const Drawer: FC<DrawerProps> = () => {
  const [open, setOpen] = useState(false);
  const [children, setChildren] = useState<ReactNode>();

  const onOpenChange = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    const onDrawer = ({ children }: EventPayload) => {
      setOpen(true);
      setChildren(children);
    };
    events.on("drawer", onDrawer);

    return () => events.off("drawer", onDrawer);
  }, []);

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
