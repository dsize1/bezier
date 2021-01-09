import React, { useMemo } from 'react';
import { Form, Button, Select, Row, Col } from 'antd';
import { CopyrightTwoTone } from '@ant-design/icons';
import InputRange from './InputRange';
import _omit from 'lodash/omit';
import _split from 'lodash/split';
import _map from 'lodash/map';
import _has from 'lodash/has';
import utils from '../../utils'
import { IControlPoints } from '../../models/controlPoints';
import useControlPoints from '../../models/controlPoints'
import useControlPlayer from '../../models/controlPlayer'

const libaray = [
  { label: 'ease', value: '.25,.1,.25,1' },
  { label: 'linear', value: '0,0,1,1' },
  { label: 'ease-in', value: '.42,0,1,1' },
  { label: 'ease-out', value: '0,0,.58,1' },
  { label: 'ease-in-out', value: '.42,0,.58,1' }
]

interface IForm extends Omit<IControlPoints, 'cubicBezier'> {
  libaray: string | undefined;
  duration: number;
}

function ControlPoints(props: Partial<{ className: string }>) {
  const { className } = props;

  const { initialPoints, points, setPoints } = useControlPoints();
  const { initialPlayer, player, setPlayer } = useControlPlayer();
  const [form] = Form.useForm<IForm>();
  const initialFormValues = useMemo(() => {
    return {
      libaray: undefined,
      ...initialPoints,
    }
  }, [initialPoints])

  const onFinish = (values: IForm, run = true) => {
    if (!player.run) {
      const nextPoints = _omit(values, ['libaray']);
      const { cp1x, cp1y, cp2x, cp2y } = nextPoints;
      const cubicBezier = utils.p2CubicBezier({ cp1x, cp1y, cp2x, cp2y });
      setPoints({ ...nextPoints, cubicBezier });
      setPlayer({ run });
    }
  }

  const onReset = () => {
    const formValues = {
      ...initialPoints,
      libaray: undefined
    };
    form.setFieldsValue(formValues);
    onFinish(formValues, false);
  }

  const onFormChange = (changedValues: Partial<IForm>, allValues: IForm) => {
    if (_has(changedValues, 'libaray')) {
      if (changedValues.libaray === undefined) {
        onReset();
      } else {
        const cps = _split(changedValues.libaray, ',');
        const [cp1x, cp1y, cp2x, cp2y] = _map(cps, Number);
        const formValues = {
          duration: allValues.duration,
          libaray: changedValues.libaray,
          cp1x,
          cp1y,
          cp2x,
          cp2y
        };
        form.setFieldsValue(formValues);
        onFinish(formValues, false);
      }
    } else {
      const formValues = {
        ...allValues,
        libaray: undefined
      };
      form.setFieldsValue(formValues);
      onFinish(formValues, false);
    }
  }

  return (
    <Form
      className={className}
      form={form} 
      initialValues={initialFormValues} 
      name="control-points" 
      onFinish={onFinish} 
      onValuesChange={onFormChange}
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
    >
      <Row justify="start" >
        <Col span={10}>
          <Form.Item
            name="cp1x"
            label={
              <span>
                控制点X1
                <CopyrightTwoTone twoToneColor="#52c41a" style={{marginLeft: 6}} />
              </span>
            }
            rules={[{ required: true }]}
          >
            <InputRange min={0} max={1} step={0.01} />
          </Form.Item>
        </Col>
        <Col span={10}>
          <Form.Item
            name="cp1y"
            label={
              <span>
                控制点Y1
                <CopyrightTwoTone twoToneColor="#52c41a" style={{marginLeft: 6}} />
              </span>
            }
            rules={[{ required: true }]}
          >
            <InputRange min={-1} max={2} step={0.01} />
          </Form.Item>
        </Col>
      </Row>
      <Row justify="start" >
        <Col span={10}>
          <Form.Item
            name="cp2x"
            label={
              <span>
                控制点X2
                <CopyrightTwoTone twoToneColor="#ff5722" style={{marginLeft: 6}} />
              </span>
            }
            rules={[{ required: true }]}
          >
            <InputRange min={0} max={1} step={0.01} />
          </Form.Item>
        </Col>
        <Col span={10}>
          <Form.Item
            name="cp2y"
            label={
              <span>
                控制定Y2
                <CopyrightTwoTone twoToneColor="#ff5722" style={{marginLeft: 6}} />
              </span>
            }
            rules={[{ required: true }]}
          >
            <InputRange min={-1} max={2} step={0.01} />
          </Form.Item>
        </Col>
      </Row>
      <Row justify="start" >
        <Col span={10}>
          <Form.Item
            name="libaray"
            label="缓动函数"
          >
            <Select
              size="small"
              style={{ width: 200 }}
              options={libaray}
              optionLabelProp="label"
              allowClear
            />
          </Form.Item>
        </Col>
        <Col span={10}>
          <Form.Item
            name="duration"
            label="时间"
            rules={[{ required: true }]}
          >
            <InputRange min={initialPoints.duration} max={10000} step={500} />
          </Form.Item>
        </Col>
      </Row>
      <Row justify="start" >        
        <Col span={10}>
          <Form.Item label="贝塞尔曲线">
            <span>{points.cubicBezier}</span>
          </Form.Item>
        </Col>
        <Col span={10} offset={4} >
          <Form.Item>
            <Button type="primary" htmlType="submit">
              开始
            </Button>
            <Button style={{ marginLeft: 12 }} htmlType="button" onClick={onReset}>
              重置
            </Button>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
}

export default ControlPoints;
