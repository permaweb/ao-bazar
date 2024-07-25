import styled from 'styled-components';

import { STYLING } from 'helpers/config';

export const Wrapper = styled.div`
	margin: 22.5px 0 0 0;
`;

export const EmptyWrapper = styled.div`
	padding: 20px;
	span {
		font-size: ${(props) => props.theme.typography.size.base};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		color: ${(props) => props.theme.colors.font.primary};
	}
`;

export const TableWrapper = styled.div`
	display: flex;
	flex-direction: column;
	overflow: hidden;
`;

export const TableHeader = styled.div`
	height: 50px;
	display: flex;
	align-items: center;
	padding: 0 15px;
	background: ${(props) => props.theme.colors.container.primary.background};
	border-bottom: 1px solid ${(props) => props.theme.colors.border.primary};
	> * {
		flex: 1;
	}
	> :last-child {
		justify-content: flex-end;
		p {
			text-align: right;
		}
	}
`;

export const TableHeaderValue = styled.div`
	p {
		font-size: ${(props) => props.theme.typography.size.base};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		color: ${(props) => props.theme.colors.font.primary};
	}
`;

export const TableBody = styled.div`
	display: flex;
	flex-direction: column;
	padding: 5px 0;
	background: ${(props) => props.theme.colors.container.primary.active};
	/* > :not(:last-child) {
		border-bottom: 1px solid ${(props) => props.theme.colors.border.primary};
	} */
`;

export const TableRow = styled.div`
	height: 50px;
	display: flex;
	align-items: center;
	padding: 0 15px;
	> * {
		flex: 1;
	}
	> :last-child {
		justify-content: flex-end;
		p {
			text-align: right;
		}
	}
`;

export const TableRowValue = styled.div`
	display: flex;
	align-items: center;
	overflow: hidden;
	p {
		font-size: ${(props) => props.theme.typography.size.small};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		color: ${(props) => props.theme.colors.font.primary};
		max-width: 90%;
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
	}
`;

export const Event = styled.div<{ type: 'Listed' | 'Sold' }>`
	display: flex;
	align-items: center;
	gap: 7.5px;
	overflow: hidden;
	padding: 0 7.5px;
	background: ${(props) =>
		props.type === 'Sold' ? props.theme.colors.indicator.active : props.theme.colors.indicator.neutral};
	border: 1px solid ${(props) => props.theme.colors.border.primary};
	border-radius: ${STYLING.dimensions.radius.alt2};
	p {
		font-size: ${(props) => props.theme.typography.size.xSmall};
		font-family: ${(props) => props.theme.typography.family.primary};
		font-weight: ${(props) => props.theme.typography.weight.bold};
		color: ${(props) => props.theme.colors.font.light1};
		line-height: 1;
		max-width: 90%;
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
	}

	svg {
		width: 15px;
		fill: ${(props) => props.theme.colors.font.light1};
		color: ${(props) => props.theme.colors.font.light1};
		margin: 6.5px 0 0 0;
	}
`;
