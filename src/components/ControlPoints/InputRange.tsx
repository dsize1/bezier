import React, { memo, FC, useCallback } from 'react';
import { InputNumber, Slider, Row, Col } from 'antd';

export interface InputRangeProps {
  value?: number;
  onChange?: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
  sliderStyle?: React.CSSProperties;
  InputNumberStyle?: React.CSSProperties;
}

const InputRange: FC<InputRangeProps> = (props) => {
  const { sliderStyle, InputNumberStyle, onChange, ...rest } = props;

  const onChangeHandler = useCallback((val) => {
    if (onChange) {
      onChange(Number(val));
    }
  }, [onChange])

  return (
    <Row>
      <Col span={14}>
        <Slider
          onChange={onChangeHandler}
          style={sliderStyle}
          {...rest}
        />
      </Col>
      <Col span={8} offset={2} >
        <InputNumber
          onChange={onChangeHandler}
          style={InputNumberStyle}
          {...rest}
        />
      </Col>
    </Row>
  )
}

export default memo(InputRange);
