import type { Meta, StoryObj } from "@storybook/react";
import { UserProvider } from "@/context/UserContext";
import { UserInfoCard } from "./UserInfoCard";

const meta: Meta<typeof UserInfoCard> = {
  title: "Dashboard/UserInfoCard",
  component: UserInfoCard,
  decorators: [
    (Story) => (
      <UserProvider>
        <div className="p-8 bg-background">
          <Story />
        </div>
      </UserProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof UserInfoCard>;

export const Default: Story = {};
