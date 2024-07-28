import React from 'react';
import { ReactSVG } from 'react-svg';

import { getRegistryProfiles, readHandler } from 'api';

import { Button } from 'components/atoms/Button';
import { CurrencyLine } from 'components/atoms/CurrencyLine';
import { IconButton } from 'components/atoms/IconButton';
import { Loader } from 'components/atoms/Loader';
import { Select } from 'components/atoms/Select';
import { OwnerLine } from 'components/molecules/OwnerLine';
import { ACTIVITY_SORT_OPTIONS, AO, ASSETS } from 'helpers/config';
import { RegistryProfileType, SelectOptionType } from 'helpers/types';
import { formatAddress, formatCount, formatDate, isFirefox } from 'helpers/utils';
import { useLanguageProvider } from 'providers/LanguageProvider';

import * as S from './styles';
import { IProps } from './types';

// TODO: quantity denomination
// TODO: profile / collection activityGroup

const GROUP_COUNT = 50;

export default function ActivityTable(props: IProps) {
	const languageProvider = useLanguageProvider();
	const language = languageProvider.object[languageProvider.current];

	const scrollRef = React.useRef(null);

	const [activity, setActivity] = React.useState<any | null>(null);
	const [activityGroups, setActivityGroups] = React.useState<any | null>(null);
	const [activityCursor, setActivityCursor] = React.useState<string>('0');
	const [activityGroup, setActivityGroup] = React.useState<any>(null);
	const [activitySortType, setActivitySortType] = React.useState<SelectOptionType | null>(ACTIVITY_SORT_OPTIONS[0]);

	const [updating, setUpdating] = React.useState<boolean>(false);

	React.useEffect(() => {
		(async function () {
			if (!activity) {
				try {
					let data: any = {};
					if (props.assetIds) data.AssetIds = props.assetIds;
					if (props.address) data.Address = props.address;

					const response = await readHandler({
						processId: AO.ucm,
						action: 'Get-Activity',
						data: data,
					});

					if (response) {
						let updatedActivity = [];

						if (response.ListedOrders) updatedActivity.push(...mapActivity(response.ListedOrders, 'Listed'));
						if (response.ExecutedOrders) updatedActivity.push(...mapActivity(response.ExecutedOrders, 'Sold'));

						setActivity(updatedActivity);
					}
				} catch (e: any) {
					console.error(e);
				}
			}
		})();
	}, [props.assetIds, props.address]);

	React.useEffect(() => {
		if (activity) {
			setActivityCursor('0');
			switch (activitySortType.id) {
				case 'new-to-old':
					activity.sort((a, b) => b.timestamp - a.timestamp);
					break;
				case 'old-to-new':
					activity.sort((a, b) => a.timestamp - b.timestamp);
					break;
			}

			let groups = [];
			for (let i = 0, j = 0; i < activity.length; i += GROUP_COUNT, j++) {
				groups[j] = activity.slice(i, i + GROUP_COUNT);
			}

			setActivityGroups(groups);
		}
	}, [activity, activitySortType]);

	React.useEffect(() => {
		(async function () {
			if (activityGroups) {
				let currentGroup = activityGroups[Number(activityCursor)];
				const associatedAddresses = [];

				associatedAddresses.push(...currentGroup.map((order: any) => order.sender));
				associatedAddresses.push(...currentGroup.map((order: any) => order.receiver));

				let associatedProfiles: RegistryProfileType[] | null = null;
				const uniqueAddresses = [...new Set(associatedAddresses.filter((address) => address !== null))];
				try {
					associatedProfiles = await getRegistryProfiles({ profileIds: uniqueAddresses });
				} catch (e: any) {
					console.error(e);
				}

				if (associatedProfiles) {
					currentGroup = currentGroup.map((order: any) => {
						return {
							...order,
							senderProfile: associatedProfiles.find((profile: RegistryProfileType) => profile.id === order.sender),
							receiverProfile: associatedProfiles.find((profile: RegistryProfileType) => profile.id === order.receiver),
						};
					});
				}

				setActivityGroup(currentGroup);
				setUpdating(false);
			}
		})();
	}, [activityGroups, activityCursor]);

	const handleActivitySortType = React.useCallback((option: SelectOptionType) => {
		setActivityGroup(null);
		setActivityGroups(null);
		setActivitySortType(option);
	}, []);

	function mapActivity(orders: any, event: 'Listed' | 'Sold') {
		let updatedActivity = [];

		if (orders && orders.length > 0) {
			const mappedActivity = orders.map((order: any) => {
				return {
					orderId: order.OrderId,
					dominantToken: order.DominantToken,
					swapToken: order.SwapToken,
					price: order.Price.toString(),
					quantity: order.Quantity.toString(),
					sender: order.Sender || null,
					receiver: order.Receiver || null,
					timestamp: order.Timestamp,
					event: event,
				};
			});

			updatedActivity = mappedActivity;
		}

		return updatedActivity;
	}

	function getDenominatedTokenValue(amount: number) {
		if (props.asset && props.asset.state && props.asset.state.denomination && props.asset.state.denomination > 1) {
			const denomination = props.asset.state.denomination;
			return `${formatCount((amount / Math.pow(10, denomination)).toString())}`;
		} else return formatCount(amount.toString());
	}

	// TODO
	const getPaginationAction = (callback: () => void) => {
		setUpdating(true);
		callback();
	};

	const previousAction = React.useMemo(() => {
		return activityGroups && Number(activityCursor) > 0
			? () => getPaginationAction(() => setActivityCursor((Number(activityCursor) - 1).toString()))
			: null;
	}, [activityGroups, activityCursor]);

	const nextAction = React.useMemo(() => {
		return activityGroups && Number(activityCursor) < Object.keys(activityGroups).length - 1
			? () => getPaginationAction(() => setActivityCursor((Number(activityCursor) + 1).toString()))
			: null;
	}, [activityGroups, activityCursor]);

	const handlePaginationAction = (type: 'next' | 'previous') => {
		const action = type === 'next' ? nextAction : previousAction;
		if (action) {
			action();
			setTimeout(() => {
				if (scrollRef.current) {
					const scrollOptions = isFirefox() ? {} : { behavior: 'smooth' };
					scrollRef.current.scrollIntoView(scrollOptions);
				}
			}, 1);
		}
	};

	const getActivity = React.useMemo(() => {
		if (!activityGroup) {
			return (
				<S.LoadingWrapper className={'border-wrapper-alt2'}>
					<Loader sm relative />
				</S.LoadingWrapper>
			);
		}

		if (activityGroup.length <= 0) {
			return (
				<S.EmptyWrapper className={'border-wrapper-alt2'}>
					<span>{language.noActivity}</span>
				</S.EmptyWrapper>
			);
		}

		return (
			<S.Wrapper className={'fade-in'} ref={scrollRef}>
				<S.Header>
					<h4>{`${language.interactions} (${activity.length})`}</h4>
					<S.HeaderActions>
						<S.SelectWrapper>
							<Select
								label={null}
								activeOption={activitySortType}
								setActiveOption={(option: SelectOptionType) => handleActivitySortType(option)}
								options={ACTIVITY_SORT_OPTIONS.map((option: SelectOptionType) => option)}
								disabled={!activityGroup || updating}
							/>
						</S.SelectWrapper>
						<S.HeaderPaginator>
							<IconButton
								type={'alt1'}
								src={ASSETS.arrow}
								handlePress={() => handlePaginationAction('previous')}
								disabled={!activityGroup || !previousAction || updating}
								dimensions={{
									wrapper: 30,
									icon: 17.5,
								}}
								tooltip={language.previous}
								className={'table-previous'}
							/>
							<IconButton
								type={'alt1'}
								src={ASSETS.arrow}
								handlePress={() => handlePaginationAction('next')}
								disabled={!activityGroup || !nextAction || updating}
								dimensions={{
									wrapper: 30,
									icon: 17.5,
								}}
								tooltip={language.next}
								className={'table-next'}
							/>
						</S.HeaderPaginator>
					</S.HeaderActions>
				</S.Header>
				<S.SubHeader>
					<p>{`Showing: ${Number(activityCursor) * GROUP_COUNT + 1}-${Math.min(
						(Number(activityCursor) + 1) * GROUP_COUNT,
						activity.length
					)}`}</p>
					{updating && <p>{`${language.updating}...`}</p>}
				</S.SubHeader>
				<S.TableWrapper className={'border-wrapper-primary scroll-wrapper'}>
					<S.TableHeader>
						<S.EventWrapper>
							<p>Event</p>
						</S.EventWrapper>
						<S.SenderWrapper>
							<p>By</p>
						</S.SenderWrapper>
						<S.ReceiverWrapper>
							<p>To</p>
						</S.ReceiverWrapper>
						<S.QuantityWrapper className={'center-value header'}>
							<p className={'header'}>Quantity</p>
						</S.QuantityWrapper>
						<S.PriceWrapper className={'end-value'}>
							<p>Price</p>
						</S.PriceWrapper>
						<S.TableHeaderValue>
							<p>Date</p>
						</S.TableHeaderValue>
					</S.TableHeader>
					<S.TableBody>
						{activityGroup.map((row: any, index: number) => (
							<S.TableRow key={index}>
								<S.EventWrapper>
									<S.Event type={row.event}>
										<ReactSVG src={row.event === 'Listed' ? ASSETS.orders : ASSETS.sell} />
										<p>{row.event}</p>
									</S.Event>
								</S.EventWrapper>
								<S.SenderWrapper>
									{row.senderProfile ? (
										<OwnerLine
											owner={{
												address: row.sender,
												profile: row.senderProfile,
											}}
											callback={null}
										/>
									) : (
										<S.Entity type={'User'}>
											<p>{formatAddress(row.sender, false)}</p>
										</S.Entity>
									)}
								</S.SenderWrapper>
								<S.ReceiverWrapper>
									{row.receiverProfile ? (
										<OwnerLine
											owner={{
												address: row.receiver,
												profile: row.receiverProfile,
											}}
											callback={null}
										/>
									) : (
										<>
											{row.receiver ? (
												<S.Entity type={'User'}>
													<p>{formatAddress(row.receiver, false)}</p>
												</S.Entity>
											) : (
												<S.Entity type={'UCM'}>
													<p>UCM</p>
												</S.Entity>
											)}
										</>
									)}
								</S.ReceiverWrapper>
								<S.QuantityWrapper className={'center-value'}>
									<p>{getDenominatedTokenValue(row.quantity)}</p>
								</S.QuantityWrapper>
								<S.PriceWrapper className={'end-value'}>
									<CurrencyLine amount={row.price} currency={row.swapToken} callback={null} />
								</S.PriceWrapper>
								<S.TableRowValue>
									<p>{formatDate(row.timestamp, 'iso')}</p>
								</S.TableRowValue>
							</S.TableRow>
						))}
					</S.TableBody>
				</S.TableWrapper>
				<S.Footer>
					<Button
						type={'primary'}
						label={language.previous}
						handlePress={() => handlePaginationAction('previous')}
						disabled={!activityGroup || !previousAction || updating}
					/>
					<Button
						type={'primary'}
						label={language.next}
						handlePress={() => handlePaginationAction('next')}
						disabled={!activityGroup || !nextAction || updating}
					/>
				</S.Footer>
			</S.Wrapper>
		);
	}, [activityGroup, updating]);

	return getActivity;
}