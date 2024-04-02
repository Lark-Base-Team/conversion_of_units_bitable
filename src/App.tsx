import './App.css';
import { bitable, FieldType } from "@lark-base-open/js-sdk";
import { Select, Banner, Button, Toast, Typography } from '@douyinfe/semi-ui';
import { IconBox, IconHome, IconExport, IconHandle, IconSync, IconLink } from '@douyinfe/semi-icons';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import convert from 'convert';
// import convert2 from 'convert-units';
import { IFieldType } from './type';
import { UNITMATCH, UNIT, TIME_UNIT, MASS_UNIT, LENGTH_UNIT, TEMPERATURE_UNIT, ANGLE_UNIT } from './const';

export default function App() {
  const [fieldsInfo, setFieldsInfo] = useState<IFieldType[]>([]);
  const [loading, setLoading] = useState(false);
  const [transformLoading, setTransformLoading] = useState(false);
  const [fieldId, setFieldId] = useState<string | undefined>();
  const [targetFieldId, setTargetFieldId] = useState<string | undefined>();
  const [UnitType, setUnitType] = useState<string | undefined>();
  const [currentUnit, setCurrentUnit] = useState<string | undefined>();
  const [targetUnit, setTargetUnit] = useState<string | undefined>();
  const { t } = useTranslation();
  const { Text } = Typography;

  const getTableMeta = async () => {
    setLoading(true);
    const selection = await bitable.base.getSelection();
    const table = await bitable.base.getTableById(selection?.tableId!);
    const fieldMetaList = await table.getFieldMetaList();
    setLoading(false);
    if (!fieldMetaList) return;
    setFieldsInfo(fieldMetaList.filter(val => val.type === FieldType.Number));
  };

  const transformUnit = async () => {
    if (!fieldId || !targetFieldId || !UnitType || !currentUnit || !targetUnit) return;
    let currentTypeFound = UNITMATCH.find(item => item.value === currentUnit);
    let targetTypeFound = UNITMATCH.find(item => item.value === targetUnit);
    if (!currentTypeFound || !targetTypeFound) return;
    if (currentTypeFound.type != targetTypeFound.type) {
      console.log(currentUnit, targetUnit);
      Toast.error(t('transform_error'));
      return;
    }
    setTransformLoading(true);
    let transformNum = 0;
    const table = await bitable.base.getActiveTable();
    // const field = await table.getFieldById(fieldId);
    const recordIds = await table.getRecordIdList();

    type allUnit = "mm" | "cm" | "m" | "km" | "in" | "feet" | "inches" | "mi" | "nautical miles" | "ms" | "seconds" | "minutes" | "hours" | "days" | "weeks" | "years" | "mg" | 'g' | 'kg' | 'tonne' | 'pound' | 'ounce' | 'deg' | 'rad' | 'turn' | 'grad' | 'celsius' | 'fahrenheit' | 'kelvin' | "radian" | "radians" | "rad" | "rads" | "r" | "turn" | "turns" | "degree" | "degrees" | "deg" | "degs" | "°" | "gradian" | "gradians" | "gon" | "gons" | "grad" | "grads" | "grade" | "grades";

    for (const recordId of recordIds) {
      const currentVal = await table.getCellValue(fieldId, recordId!);
      if (typeof currentVal !== 'number' || !currentVal) continue;

      const transformVal = convert(currentVal, currentUnit as any).to(targetUnit as any);
      const res = await table.setCellValue(targetFieldId!, recordId!, transformVal as any);
      // const res = await table.setCellValue(targetFieldId!, recordId!, convert(currentVal, currentUnit as allUnit).to(targetUnit as allUnit));

      if (!res) {
        Toast.error(t('transform_fail', { 'transformNum': transformNum }));
        setTransformLoading(false);
        return;
      }
      transformNum++;
    }
    if (transformNum) {
      Toast.success(t('transform_success', { 'transformNum': transformNum }));
    } else {
      Toast.warning(t('transform_warning', { 'transformNum': transformNum }));
    }
    setTransformLoading(false);

  };

  useEffect(() => {
    getTableMeta();
  }, []);

  const matchType = (value: any, currentOrTarget: string) => {
    const regex = /[\(（]([^）)]+)[\)）]/g;
    const matches = value.name.match(regex);
    if (matches) {
      const contents = matches.map((match: string) => match.replace(/[\(（|\)）]/g, ''));
      let unitTypeFound = null;
      if (contents) {
        for (let content of contents) {
          console.log(content);
          let tmp = UNITMATCH.find(item => item.name === content)
          console.log(tmp)
          if (tmp) {
            unitTypeFound = tmp
            if (currentOrTarget === 'current') {
              setCurrentUnit(unitTypeFound.value);
            } else {
              setTargetUnit(unitTypeFound.value);
            }
            return unitTypeFound.type
          }
        }
      }
      return null
    } else {
      return null
    }
  }

  // 选择字段后切换判断单位选项
  const getUnitType = (value: any) => {
    // if (!fieldId) return;
    // 测试字符串

    setFieldId(value)
    const field = fieldsInfo.find(val => val.id === value);

    let unitTypeFound = matchType(field, "current")
    console.log("matchType", unitTypeFound)

    if (!field) {
      return
    } else {
      if (field.name.search("长度") !== -1 || field.name.toLowerCase().search("length") !== -1 || unitTypeFound === "LENGTH_UNIT") {
        setUnitType("LENGTH_UNIT");
        console.log("unit_type:", field.name);
        // const [UnitType, setUnitType] = useState("LENGTH_UNIT");
      } else if (field.name.search("角度") !== -1 || field.name.toLowerCase().search("angle") !== -1 || unitTypeFound === "ANGLE_UNIT") {
        setUnitType("ANGLE_UNIT");
        console.log("unit_type:", field.name);
      } else if (field.name.search("温度") !== -1 || field.name.toLowerCase().search("temperature") !== -1 || unitTypeFound === "TEMPERATURE_UNIT") {
        setUnitType("TEMPERATURE_UNIT");
        console.log("unit_type:", field.name);
      } else if (field.name.search("质量") !== -1 || field.name.toLowerCase().search("mass") !== -1 || unitTypeFound === "MASS_UNIT") {
        setUnitType("MASS_UNIT");
        console.log("unit_type:", field.name);
      } else {
        setUnitType("TIME_UNIT");
        console.log("unit_type:", field.name);
      }
    }
  };

  const getTargetUnitType = (value: any) => {
    // if (!fieldId) return;
    // 测试字符串

    setTargetFieldId(value)
    const field = fieldsInfo.find(val => val.id === value);

    let unitTypeFound = matchType(field, "target")
    console.log("matchType", unitTypeFound)

    if (!field) {
      return
    } else {
      if (field.name.search("长度") !== -1 || field.name.toLowerCase().search("length") !== -1 || unitTypeFound === "LENGTH_UNIT") {
        setUnitType("LENGTH_UNIT");
        console.log("unit_type:", field.name);
        // const [UnitType, setUnitType] = useState("LENGTH_UNIT");
      } else if (field.name.search("角度") !== -1 || field.name.toLowerCase().search("angle") !== -1 || unitTypeFound === "ANGLE_UNIT") {
        setUnitType("ANGLE_UNIT");
        console.log("unit_type:", field.name);
      } else if (field.name.search("温度") !== -1 || field.name.toLowerCase().search("temperature") !== -1 || unitTypeFound === "TEMPERATURE_UNIT") {
        setUnitType("TEMPERATURE_UNIT");
        console.log("unit_type:", field.name);
      } else if (field.name.search("质量") !== -1 || field.name.toLowerCase().search("mass") !== -1 || unitTypeFound === "MASS_UNIT") {
        setUnitType("MASS_UNIT");
        console.log("unit_type:", field.name);
      } else {
        setUnitType("TIME_UNIT");
        console.log("unit_type:", field.name);
      }
    }
  };

  // 选择单位类型后切换可选单位选项
  const getUnits = () => {
    // if (!fieldId) return <></>;
    // 判断单位类型
    if (UnitType == 'LENGTH_UNIT') {
      return <>
        <div className="title">
          <Banner
            icon={<IconHome />}
            fullMode={false}
            type="warning"
            description={t('select_current_unit')}
            closeIcon={null}
          />
        </div>
        <Select
          style={{ width: '100%' }}
          value={t(currentUnit)}
          onSelect={val => setCurrentUnit(val as any)}
          filter>
          {
            LENGTH_UNIT.map(val => {
              return <Select.Option value={val.value}>{t(val.name)}</Select.Option>
            })
          }
        </Select>
        <div className="title">
          <Banner
            icon={<IconSync />}
            fullMode={false}
            type="warning"
            description={t('select_target_unit')}
            closeIcon={null}
          />
        </div>
        <Select
          style={{ width: '100%' }}
          value={t(targetUnit)}
          onSelect={val => setTargetUnit(val as any)}
          filter>
          {
            LENGTH_UNIT.map(val => {
              return <Select.Option value={val.value}>{t(val.name)}</Select.Option>
            })
          }
        </Select>
      </>
    } else if (UnitType == 'ANGLE_UNIT') {
      return <>
        <div className="title">
          <Banner
            icon={<IconHome />}
            fullMode={false}
            type="warning"
            description={t('select_current_unit')}
            closeIcon={null}
          />
        </div>
        <Select
          style={{ width: '100%' }}
          value={t(currentUnit)}
          onSelect={val => setCurrentUnit(val as any)}
          filter>
          {
            ANGLE_UNIT.map(val => {
              return <Select.Option value={val.value}>{t(val.name)}</Select.Option>
            })
          }
        </Select>
        <div className="title">
          <Banner
            icon={<IconSync />}
            fullMode={false}
            type="warning"
            description={t('select_target_unit')}
            closeIcon={null}
          />
        </div>
        <Select
          style={{ width: '100%' }}
          value={t(targetUnit)}
          onSelect={val => setTargetUnit(val as any)}
          filter>
          {
            ANGLE_UNIT.map(val => {
              return <Select.Option value={val.value}>{t(val.name)}</Select.Option>
            })
          }
        </Select>
      </>
    } else if (UnitType == 'TEMPERATURE_UNIT') {
      return <>
        <div className="title">
          <Banner
            icon={<IconHome />}
            fullMode={false}
            type="warning"
            description={t('select_current_unit')}
            closeIcon={null}
          />
        </div>
        <Select
          style={{ width: '100%' }}
          value={t(currentUnit)}
          onSelect={val => setCurrentUnit(val as any)}
          filter>
          {
            TEMPERATURE_UNIT.map(val => {
              return <Select.Option value={val.value}>{t(val.name)}</Select.Option>
            })
          }
        </Select>
        <div className="title">
          <Banner
            icon={<IconSync />}
            fullMode={false}
            type="warning"
            description={t('select_target_unit')}
            closeIcon={null}
          />
        </div>
        <Select
          style={{ width: '100%' }}
          value={t(targetUnit)}
          onSelect={val => setTargetUnit(val as any)}
          filter>
          {
            TEMPERATURE_UNIT.map(val => {
              return <Select.Option value={val.value}>{t(val.name)}</Select.Option>
            })
          }
        </Select>
      </>
    } else if (UnitType == 'MASS_UNIT') {
      return <>
        <div className="title">
          <Banner
            icon={<IconHome />}
            fullMode={false}
            type="warning"
            description={t('select_current_unit')}
            closeIcon={null}
          />
        </div>
        <Select
          style={{ width: '100%' }}
          value={t(currentUnit)}
          onSelect={val => setCurrentUnit(val as any)}
          filter>
          {
            MASS_UNIT.map(val => {
              return <Select.Option value={val.value}>{t(val.name)}</Select.Option>
            })
          }
        </Select>
        <div className="title">
          <Banner
            icon={<IconSync />}
            fullMode={false}
            type="warning"
            description={t('select_target_unit')}
            closeIcon={null}
          />
        </div>
        <Select
          style={{ width: '100%' }}
          value={t(targetUnit)}
          onSelect={val => setTargetUnit(val as any)}
          filter>
          {
            MASS_UNIT.map(val => {
              return <Select.Option value={val.value}>{t(val.name)}</Select.Option>
            })
          }
        </Select>
      </>
    }
    // 默认为时间单位
    return <>
      <div className="title">
        <Banner
          icon={<IconHome />}
          fullMode={false}
          type="warning"
          description={t('select_current_unit')}
          closeIcon={null}
        />
      </div>
      <Select
        style={{ width: '100%' }}
        value={t(currentUnit)}
        onSelect={val => setCurrentUnit(val as any)}
        filter>
        {
          TIME_UNIT.map(val => {
            return <Select.Option value={val.value}>{t(val.name)}</Select.Option>
          })
        }
      </Select>
      <div className="title">
        <Banner
          icon={<IconSync />}
          fullMode={false}
          type="warning"
          description={t('select_target_unit')}
          closeIcon={null}
        />
      </div>
      <Select
        style={{ width: '100%' }}
        value={t(targetUnit)}
        onSelect={val => setTargetUnit(val as any)}
        filter>
        {
          TIME_UNIT.map(val => {
            return <Select.Option value={val.value}>{t(val.name)}</Select.Option>
          })
        }
      </Select>
    </>
  }

  return (
    <div className={'container'}>
      <div className="title">
        <Banner
          fullMode={false}
          type="info"
          description={<div>{t('script_des')} <a href='https://u1tn45bihdp.feishu.cn/docx/VO0sdKZ0roDt9JxLiMBcjmmPnfw?from=from_copylink' target="_blank">{t('help_doc')}</a></div>}
          closeIcon={null}
        />
      </div>
      <div className="item">
        <Banner
          icon={<IconBox />}
          fullMode={false}
          type="warning"
          description={t('select_field')}
          closeIcon={null}
        />
      </div>
      <Select
        filter
        style={{ width: '100% ' }}
        loading={loading}
        onDropdownVisibleChange={getTableMeta}
        onSearch={getTableMeta}
        onSelect={val => getUnitType(val as any)}
      >
        {
          fieldsInfo.map(val => {
            return <Select.Option value={val.id}>{val.name}</Select.Option>
          })
        }
      </Select>

      <div className="item">
        <Banner
          icon={<IconExport />}
          fullMode={false}
          type="warning"
          description={t('select_target')}
          closeIcon={null}
        />
      </div>
      <Select
        filter
        style={{ width: '100% ' }}
        loading={loading}
        onDropdownVisibleChange={getTableMeta}
        onSearch={getTableMeta}
        onSelect={val => getTargetUnitType(val as any)}
      >
        {
          fieldsInfo.map(val => {
            return <Select.Option value={val.id}>{val.name}</Select.Option>
          })
        }
      </Select>

      <div className="item">
        <Banner
          icon={<IconHandle />}
          fullMode={false}
          type="warning"
          description={t('select_unit_type')}
          closeIcon={null}
        />
      </div>

      <Select
        style={{ width: '100%' }}
        defaultValue={t(UnitType)}
        value={t(UnitType)}
        onSelect={val => setUnitType(val as any)}
        filter>
        {
          UNIT.map(val => {
            return <Select.Option value={val.value}>{t(val.name)}</Select.Option>
          })
        }
      </Select>

      {getUnits()}

      <div className={'footer'}>
        <Button
          loading={transformLoading}
          disabled={!fieldId || !targetFieldId || !UnitType || !targetUnit || !currentUnit}
          theme="solid"
          type="primary"
          onClick={transformUnit}
        >{t('transform')}</Button>
      </div>

    </div>
  )
}
