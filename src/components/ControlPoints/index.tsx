import React, { useMemo } from 'react';
import { Form, Button, Select, Row, Col } from 'antd';
import InputRange from './InputRange';
import _omit from 'lodash/omit';
import _split from 'lodash/split';
import _has from 'lodash/has';
import { IControlPoints } from '../../models/controlPoints';
import useControlPoints from '../../models/controlPoints'

const libaray = [
  { label: 'ease', value: '.25,.1,.25,1' },
  { label: 'linear', value: '0,0,1,1' },
  { label: 'ease-in', value: '.42,0,1,1' },
  { label: 'ease-out', value: '0,0,.58,1' },
  { label: 'ease-in-out', value: '.42,0,.58,1' }
]

interface IForm extends IControlPoints {
  libaray: string;
}

function ControlPoints() {
  const { initialPoints, points, setPoints } = useControlPoints();
  const [form] = Form.useForm<IForm>();

  const onFinish = (values: IForm) => {
    const nextPoints = _omit(values, ['libaray']);
    setPoints(nextPoints);
  }

  const onReset = () => {
    form.setFieldsValue({
      ...initialPoints,
      libaray: undefined
    });
  }

  const onFormChange = (changedValues: any, allValues: IForm) => {
    if (_has(changedValues, 'libaray')) {
      if (changedValues.libaray === undefined) {
        onReset();
      } else {
        const [cp1x, cp1y, cp2x, cp2y] = _split(changedValues.libaray, ',');
        form.setFieldsValue({
          libaray: changedValues.libaray,
          cp1x: Number(cp1x),
          cp1y: Number(cp1y),
          cp2x: Number(cp2x),
          cp2y: Number(cp2y)
        });
      }
    } else {
      form.setFieldsValue({
        ...allValues,
        libaray: undefined
      });
    }
  }

  const bezierCurve = useMemo(() => {
    const { cp1x, cp1y, cp2x, cp2y } = points;
    return `cubic-bezier(${cp1x},${cp1y},${cp2x},${cp2y})`
  }, [points]);

  return (
    <Form
      form={form} 
      initialValues={initialPoints} 
      name="control-points" 
      onFinish={onFinish} 
      onValuesChange={onFormChange}
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
    >
      <Row justify="start" >
        <Col span={4} offset={4} >
          <Form.Item label="贝塞尔曲线:">
            <span>{bezierCurve}</span>
          </Form.Item>
        </Col>
        <Col span={4} >
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
        <Col span={8}>
          <Form.Item
            name="duration"
            label="时间"
            rules={[{ required: true }]}
          >
            <InputRange min={1000} max={10000} step={500} />
          </Form.Item>
        </Col>
      </Row>
      <Row justify="start" >
        <Col span={8} offset={4} >
          <Form.Item
            name="cp1x"
            label="控制点X1"
            rules={[{ required: true }]}
          >
            <InputRange min={0} max={1} step={0.01} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="cp1y"
            label="控制点Y1"
            rules={[{ required: true }]}
          >
            <InputRange min={-0.5} max={1.5} step={0.01} />
          </Form.Item>
        </Col>
      </Row>
      <Row justify="start" >
        <Col span={8} offset={4} >
          <Form.Item
            name="cp2x"
            label="控制点X2"
            rules={[{ required: true }]}
          >
            <InputRange min={0} max={1} step={0.01} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="cp2y"
            label="控制定Y2"
            rules={[{ required: true }]}
          >
            <InputRange min={-0.5} max={1.5} step={0.01} />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={20} >
        <Col offset={16} span={4} >
          <Button type="primary" htmlType="submit">
            确认
          </Button>
          <Button style={{ marginLeft: 12 }} htmlType="button" onClick={onReset}>
            重置
          </Button>
        </Col>
      </Row>
    </Form>
  );
}

export default ControlPoints;
