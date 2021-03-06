import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SafeUrl } from '@angular/platform-browser';

import { TranslateService } from '@ngx-translate/core';

import { AttributeType, IOrganizationUnit, IObject, RelationType } from '../../../core/data/data.classes';
import { RepositoryService } from '../../../core/repository.service';
import { SystemTaskAttributes } from '../../../core/data/system.types';
import { TypeIconService } from '../../../core/type-icon.service';
import { Guid } from 'guid-typescript';
import { OrgUnitAttributeItem, DateAttributeItem, StringAttributeItem, AttributeItem } from 'src/app/core/ui/attribute.item';

@Component({
    selector: 'app-task-details',
    templateUrl: './task-details.component.html',
    styleUrls: ['./task-details.component.css']
})
/** task-details component*/
export class TaskDetailsComponent implements OnInit, OnDestroy {
  
  private _task: IObject;

  @Input()
  set task(value: IObject) {
    this._task = value;
    this.loadTask(value);
  }

  get task(): IObject {
    return this._task;
  }

  error;
  taskTypeIcon: SafeUrl;
  taskTypeTitle: string;

  stateTitle: string;
  stateIcon: SafeUrl;

  initiator: AttributeItem;
  executor: AttributeItem;
  attributes: AttributeItem[];

  isLoading: boolean;
  hasAttachments: boolean;

  /** task ctor */
  constructor(
    private activatedRoute: ActivatedRoute,
    private repository: RepositoryService,
    private translate: TranslateService,
    private iconService: TypeIconService) {

  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
  }

  loadTask(source: IObject): void {
    if (!source)
      return;

    this.taskTypeIcon = this.iconService.getTypeIcon(source);
    this.taskTypeTitle = source.type.title;

    this.attributes = new Array<AttributeItem>();
    this.executor = null;
    this.initiator = null;

    const type = source.type;

    const relations = source.relations.filter(r => r.type === RelationType.TaskAttachments);
    this.hasAttachments = relations.length > 0;

    const sortedAttributes = type.attributes.sort((a, b) => a.displaySortOrder - b.displaySortOrder);
    for (let typeAttr of sortedAttributes) {
      const value = source.attributes[typeAttr.name];

      if (typeAttr.name === SystemTaskAttributes.EXECUTOR_POSITION) {
        const orgUnits = this.getOrgUnits(value);
        this.executor = new OrgUnitAttributeItem(typeAttr, orgUnits, this.repository);
        continue;
      }

      if (typeAttr.name === SystemTaskAttributes.INITIATOR_POSITION) {
        const orgUnits = this.getOrgUnits(value);
        this.initiator = new OrgUnitAttributeItem(typeAttr, orgUnits, this.repository);
        continue;
      }

      if (typeAttr.name == "state"){
        if (!Guid.isGuid(value))
          continue;
        
        var state = this.repository.getUserState(value);
        this.stateIcon = this.iconService.getSvgIcon(state.icon);
        this.stateTitle = state.title;
      }

      if (typeAttr.isService)
        continue;

      if (typeAttr.type === AttributeType.DateTime) {
        const dateItem = new DateAttributeItem(typeAttr, value, this.translate.currentLang);
        this.attributes.push(dateItem);
        continue;
      }

      if (typeAttr.type === AttributeType.OrgUnit) {
        const orgUnits = this.getOrgUnits(value);
        const orgUnitItem = new OrgUnitAttributeItem(typeAttr, orgUnits, this.repository);
        this.attributes.push(orgUnitItem);
        continue;
      }

      const item = new StringAttributeItem(typeAttr, value);
      this.attributes.push(item);
    }
  }

  private getOrgUnits(positions: number[]): IOrganizationUnit[] {

    const result = new Array<IOrganizationUnit>();
    if (!positions) {
      return result;
    }

    for (let pos of positions) {
      const orgUnit = this.repository.getOrganizationUnit(pos);
      result.push(orgUnit);
    }

    return result;
  }
}