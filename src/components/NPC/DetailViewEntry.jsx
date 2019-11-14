 /*eslint no-unused-vars: [0, {"args": "after-used", "argsIgnorePattern": "^_"}]*/

import React, { useEffect } from 'react';
import { Accordion, Icon, Button, Menu, Form, Popup, Header } from 'semantic-ui-react';
import { TableFilter } from '../TableFilter';
import { StorageAccordion } from '../StorageAccordion';
import { camelCaseToTitle } from '../../lib/str';
import NpcData from '../../storage/NpcData';
import * as shortid from 'shortid';
import { inlineEval } from '../../generator/modules/evalAtCtx';

/*
function DataViewEntryCategory({
	titleKey, description, children,
	active, onClick
})
{
	return (
		<div>
			<Accordion.Title
				index={titleKey}
				active={active}
				onClick={onClick}
			>
				{camelCaseToTitle(titleKey)} <Icon name='dropdown' />
			</Accordion.Title>
			<Accordion.Content active={active}>
				{description}
				{children}
			</Accordion.Content>
		</div>
	);
}
//*/

function makeModifierPopup(title, popupTitle, itemMap)
{
	return (
		<Popup
			trigger={<label>{title} ({Object.keys(itemMap).length})</label>}
			content={(
				<div>
					<Header as='h5'>{popupTitle}</Header>
					{Object.keys(itemMap).map((key) => (
						<div key={key}>
							{key}: {JSON.stringify(itemMap[key])}
						</div>
					))}
				</div>
			)}
		/>
	);
}

export function DataViewEntry({
	propertyKey, tableCollection, categoryFields, entryKey, storageKey,
	active, onClick,
	depth,
})
{
	const npcSchema = tableCollection ? tableCollection.getNpcSchema() : null;

	const categories = {};
	const npc = NpcData.get();
	const npcModifiedData = npc.getModifiedData();
	const entry = npc.getEntry(entryKey);
	const field = entry.getField(npcSchema);

	const sourceTableKey = field.getSourceTableKey(tableCollection);

	const [_refreshKey, refresh] = React.useState(undefined);
	useEffect(() => {
		function onChanged({ details })
		{
			refresh(shortid.generate());
		}
		NpcData.get().getEntry(entryKey).addListenerOnChanged(onChanged);
		return () => {
			NpcData.get().getEntry(entryKey).removeListenerOnChanged(onChanged);
		};
	});

	/*
	if (childTableKeys.length > 0)
	{
		categories['children'] = {
			storageAccordianComponent: DataViewEntryCategory,
			titleKey: 'children',
			description: 'These are the child fields for this item',
			children: [
				(
					<DetailViewEntryList
						key={0}
						parentPropertyKey={propertyKey}
						tableCollection={tableCollection}
						childTableKeys={childTableKeys}
					/>
				)
			]
		};
	}
	//*/

	const isMissingSourceTable = field.isMissingSourceTable(tableCollection, (k) => inlineEval(k, npcModifiedData));
	const modifiersFromEntry = entry.getModifiers();
	const modifiersFromEntryCount = Object.keys(modifiersFromEntry).length;
	const hasModifiers = modifiersFromEntryCount > 0;
	const modifiersOfEntry = {}; // TODO: collective modifiers of this entry
	const isModified = Object.keys(modifiersOfEntry).length > 0;

	if (active)
	{
		console.log(entry, modifiersFromEntry);
	}

	return (
		<div>
			<Menu secondary style={{ marginBottom: 0 }}>
				<Menu.Item fitted>
					<Accordion.Title
						index={propertyKey}
						active={!isMissingSourceTable && active}
						onClick={onClick}
					>
						{!isMissingSourceTable && <Icon name='dropdown' />}
						{camelCaseToTitle(propertyKey)}
						<span> - {entry.toString(npcModifiedData)}</span>
						{isMissingSourceTable && (
							<span> - No generator available</span>
						)}
					</Accordion.Title>
				</Menu.Item>
				{!isMissingSourceTable && <Menu.Item fitted position='right'>
					<Button
						icon={'refresh'}
						onClick={() => entry.regenerate(npcSchema, npc.getModifiedData())}
						content={camelCaseToTitle(propertyKey)}
					/>
				</Menu.Item>}
			</Menu>
			{!isMissingSourceTable && active && <Accordion.Content
			>
				<div style={{
					borderLeft: '2px solid rgba(34,36,38,.15)',
					paddingLeft: '10px',
					marginLeft: '7px',
				}}>
					<Form>
						<Form.Group widths={'equal'}>
							{sourceTableKey !== undefined && (
								<Form.Field
									label={'Filter'}
									control={TableFilter}
									tableCollection={tableCollection}
									tableKey={inlineEval(sourceTableKey, npcModifiedData)}
									storageKey={entryKey}
								/>
							)}
							<Form.Field>
								<label>Generated Value</label>
								{entry.getRawValue() ? entry.toString(npcModifiedData) : (
									<span style={{ color: 'red' }}>Not Generated</span>
								)}
							</Form.Field>
							<Form.Field>
								<label>Value with Modifiers</label>
								<span style={{ color: 'red' }}>Not Generated</span>
							</Form.Field>
							<Form.Field>
								{hasModifiers && makeModifierPopup('Modifiers', 'Modifing Entries', modifiersFromEntry)}
								{isModified && makeModifierPopup('Modified By', 'Modified by Entries', modifiersOfEntry)}
							</Form.Field>
						</Form.Group>
					</Form>
					<StorageAccordion
						storageKey={storageKey}
						entries={categories}
					/>
				</div>
			</Accordion.Content>}
		</div>
	);
}
