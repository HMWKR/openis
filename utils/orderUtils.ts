/**
 * 주문번호 생성 유틸리티
 * 매일 100번부터 시작하여 순차적으로 증가
 */
export const generateOrderNumber = (): number => {
  const today = new Date().toDateString();
  const storedDate = localStorage.getItem('orderDate');
  let counter = parseInt(localStorage.getItem('orderCounter') || '100', 10);

  // 날짜가 바뀌면 카운터 리셋
  if (storedDate !== today) {
    counter = 100;
    localStorage.setItem('orderDate', today);
  }

  counter += 1;
  localStorage.setItem('orderCounter', counter.toString());

  return counter;
};

/**
 * 예상 준비 시간 계산 (분)
 * 기본 3분 + 아이템당 1분
 */
export const calculatePrepTime = (itemCount: number): number => {
  return Math.max(3, 3 + Math.ceil(itemCount * 1));
};
