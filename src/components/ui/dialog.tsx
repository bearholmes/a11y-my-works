import * as Headless from '@headlessui/react';
import clsx from 'clsx';
import type React from 'react';
import { Text } from './text';

const sizes = {
  xs: 'max-w-xs',
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': '',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
};

export function Dialog({
  size = 'lg',
  className,
  children,
  ...props
}: {
  size?: keyof typeof sizes;
  className?: string;
  children: React.ReactNode;
} & Omit<Headless.DialogProps, 'as' | 'className'>) {
  return (
    <Headless.Dialog {...props}>
      <Headless.DialogBackdrop
        transition
        className="fixed inset-0 flex w-screen justify-center overflow-y-auto bg-zinc-950/25 px-2 py-2 transition duration-100 focus:outline-0 data-closed:opacity-0 data-enter:ease-out data-leave:ease-in dark:bg-zinc-950/50"
      />

      <div className="fixed inset-0 w-screen overflow-y-auto pt-6">
        <div className="grid min-h-full grid-rows-[1fr_auto] justify-items-center">
          <Headless.DialogPanel
            transition
            className={clsx(
              className,
              sizes[size],
              'row-start-2 w-full min-w-0 rounded-t-3xl bg-white p-[--gutter] shadow-lg ring-1 ring-zinc-950/10 [--gutter:--spacing(8)] dark:bg-zinc-900 dark:ring-white/10 forced-colors:outline',
              'transition duration-100 will-change-transform data-closed:translate-y-12 data-closed:opacity-0 data-enter:ease-out data-leave:ease-in'
            )}
          >
            {children}
          </Headless.DialogPanel>
        </div>
      </div>
    </Headless.Dialog>
  );
}

export function DialogTitle({
  className,
  ...props
}: { className?: string } & Omit<
  Headless.DialogTitleProps,
  'as' | 'className'
>) {
  return (
    <Headless.DialogTitle
      {...props}
      className={clsx(
        className,
        'text-lg/6 font-semibold text-balance text-zinc-950 dark:text-white'
      )}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: { className?: string } & Omit<
  Headless.DescriptionProps<typeof Text>,
  'as' | 'className'
>) {
  return (
    <Headless.Description
      as={Text}
      {...props}
      className={clsx(className, 'mt-2 text-pretty')}
    />
  );
}

export function DialogBody({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  return <div {...props} className={clsx(className, 'mt-6')} />;
}

export function DialogActions({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      {...props}
      className={clsx(
        className,
        'mt-8 flex flex-col-reverse items-center justify-end gap-3 *:w-full'
      )}
    />
  );
}
