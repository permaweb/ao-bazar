import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import { URLS } from 'helpers/config';
import { formatCount } from 'helpers/utils';
import { RootState } from 'store';

import * as S from './styles';
import { IProps } from './types';

export default function CurrencyLine(props: IProps) {
	const currenciesReducer = useSelector((state: RootState) => state.currenciesReducer);

	function getDenominatedTokenValue(amount: number, currency: string) {
		if (
			currenciesReducer &&
			currenciesReducer[currency] &&
			currenciesReducer[currency].Denomination &&
			currenciesReducer[currency].Denomination > 1
		) {
			const denomination = currenciesReducer[currency].Denomination;
			return `${formatCount((amount / Math.pow(10, denomination)).toString())}`;
		}
		return formatCount(amount.toString());
	}

	function getCurrency() {
		if (props.currency && currenciesReducer[props.currency]) {
			let currency = null;
			if (currenciesReducer[props.currency].Ticker) {
				currency = <span>{currenciesReducer[props.currency].Ticker}</span>;
			}

			return (
				<Link to={`${URLS.asset}${props.currency}`} onClick={() => (props.callback ? props.callback() : {})}>
					<S.Currency>{currency}</S.Currency>
				</Link>
			);
		}
		return null;
	}

	return props.amount && props.currency ? (
		<S.Wrapper>
			<span>{getDenominatedTokenValue(Number(props.amount), props.currency)}</span>
			{getCurrency()}
		</S.Wrapper>
	) : null;
}