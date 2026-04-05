"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { CreatePropertyPayload } from "../pages/types";

// Define the shape of the context
interface PropertyCreationContextType {
  property: Partial<CreatePropertyPayload>;
  setProperty: (data: Partial<CreatePropertyPayload>) => void;
  resetProperty: () => void;
}

const PropertyCreationContext = createContext<
  PropertyCreationContextType | undefined
>(undefined);

export const PropertyCreationProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [property, setPropertyState] = useState<Partial<CreatePropertyPayload>>(
    {},
  );

  const setProperty = useCallback((data: Partial<CreatePropertyPayload>) => {
    setPropertyState((prev) => ({ ...prev, ...data }));
  }, []);

  const resetProperty = useCallback(() => {
    setPropertyState({});
  }, []);

  return (
    <PropertyCreationContext.Provider
      value={{ property, setProperty, resetProperty }}
    >
      {children}
    </PropertyCreationContext.Provider>
  );
};

export const usePropertyCreation = () => {
  const ctx = useContext(PropertyCreationContext);
  if (!ctx)
    throw new Error(
      "usePropertyCreation must be used within a PropertyCreationProvider",
    );
  return ctx;
};
