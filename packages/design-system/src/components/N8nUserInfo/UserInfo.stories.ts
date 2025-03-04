import type { StoryFn } from '@storybook/vue';
import N8nUserInfo from './UserInfo.vue';

export default {
	title: 'Modules/UserInfo',
	component: N8nUserInfo,
	parameters: {
		backgrounds: { default: '--color-background-light' },
	},
};

const Template: StoryFn = (args, { argTypes }) => ({
	props: Object.keys(argTypes),
	components: {
		N8nUserInfo,
	},
	template: '<n8n-user-info v-bind="$props" />',
});

export const Member = Template.bind({});
Member.args = {
	firstName: 'Oscar',
	lastName: 'Wilde',
	email: 'test@quicksales.vn',
};

export const Current = Template.bind({});
Current.args = {
	firstName: 'Ham',
	lastName: 'Sam',
	email: 'test@quicksales.vn',
	isCurrentUser: true,
};

export const Invited = Template.bind({});
Invited.args = {
	email: 'test@quicksales.vn',
	isPendingUser: true,
};
