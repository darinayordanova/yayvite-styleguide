import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button } from '../Button/Button';
import { Checkbox } from '../Checkbox/Checkbox';
import { TextInput } from '../TextInput/TextInput';
import { Modal } from './Modal';

const meta = {
  title: 'Components/Modal',
  component: Modal,
  args: {
    open: true,
    title: 'Send invitations?',
    description: 'Your 48 guests will receive their invitation by email right away.',
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Closes with the × button, Escape or a click on the backdrop. */
export const WithClose: Story = {
  render: function Render(args) {
    const [open, setOpen] = useState(false);
    const close = () => setOpen(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open modal</Button>
        <Modal
          {...args}
          open={open}
          onClose={close}
          footer={
            <>
              <Button variant="secondary" onClick={close}>
                Not yet
              </Button>
              <Button iconEnd="arrow" onClick={close}>
                Send now
              </Button>
            </>
          }
        />
      </>
    );
  },
};

/** No × button; Escape and backdrop clicks are ignored, so the user must choose an action. */
export const WithoutClose: Story = {
  args: {
    title: 'Before you continue',
    description: 'Please confirm you have permission to email everyone on your guest list.',
    dismissible: false,
    size: 'sm',
  },
  render: function Render(args) {
    const [open, setOpen] = useState(false);
    const [agreed, setAgreed] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open modal</Button>
        <Modal
          {...args}
          open={open}
          footer={
            <Button disabled={!agreed} onClick={() => setOpen(false)}>
              Continue
            </Button>
          }
        >
          <Checkbox
            label="My guests have agreed to receive emails"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
          />
        </Modal>
      </>
    );
  },
};

export const WithForm: Story = {
  args: { title: 'Add a guest', description: undefined },
  render: function Render(args) {
    const [open, setOpen] = useState(false);
    const close = () => setOpen(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open modal</Button>
        <Modal
          {...args}
          open={open}
          onClose={close}
          footer={
            <>
              <Button variant="secondary" onClick={close}>
                Cancel
              </Button>
              <Button onClick={close}>Add guest</Button>
            </>
          }
        >
          <div style={{ display: 'grid', gap: 16 }}>
            <TextInput label="Full name" placeholder="Mia Evans" data-autofocus />
            <TextInput label="Email" iconStart="mail" placeholder="name@example.com" />
            <Checkbox label="Allow a plus one" />
          </div>
        </Modal>
      </>
    );
  },
};

/** Long content scrolls inside the modal while the header and footer stay put. */
export const LongContent: Story = {
  args: { title: 'Terms of service', description: undefined, size: 'lg' },
  render: function Render(args) {
    const [open, setOpen] = useState(false);
    const close = () => setOpen(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open modal</Button>
        <Modal {...args} open={open} onClose={close} footer={<Button onClick={close}>Accept</Button>}>
          {Array.from({ length: 20 }, (_, i) => (
            <p key={i} style={{ margin: '0 0 12px' }}>
              {i + 1}. Invitations are sent on your behalf to the addresses you provide. You are
              responsible for making sure your guests are happy to hear from you.
            </p>
          ))}
        </Modal>
      </>
    );
  },
};
