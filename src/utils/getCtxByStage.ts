const getCtxByStage = (
  stage: React.RefObject<HTMLCanvasElement>
): CanvasRenderingContext2D | null | undefined => {
  return stage?.current?.getContext('2d')
}

export default getCtxByStage;
