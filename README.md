# 항해 플러스 프론트엔드 4기 과제 5주차 <br/>: Chapter 2-2. 디자인 패턴과 함수형 프로그래밍
- [과제 체크포인트](#과제-체크포인트)
    - [기본과제](#기본과제)
    - [심화과제](#심화과제)
- [과제 셀프회고](#과제-셀프회고)
    - [과제에서 좋았던 부분](#과제에서-좋았던-부분)
    - [과제를 하면서 새롭게 알게된 점](#과제를-하면서-새롭게-알게된-점)
    - [과제를 진행하면서 아직 애매하게 잘 모르겠다 하는 점, 혹은 뭔가 잘 안되서 아쉬운 것들](#과제를-진행하면서-아직-애매하게-잘-모르겠다-하는-점-혹은-뭔가-잘-안되서-아쉬운-것들)
- [리뷰 받고 싶은 내용이나 궁금한 것에 대한 질문](#리뷰-받고-싶은-내용이나-궁금한-것에-대한-질문)

## 과제 체크포인트

### 기본과제

- React의 hook 이해하기
- 함수형 프로그래밍에 대한 이해
- Component에서 비즈니스 로직을 분리하기
- 비즈니스 로직에서 특정 엔티티만 다루는 계산을 분리하기

- [x] Component에서 사용되는 Data가 아닌 로직들은 hook으로 옮겨졌나요?
- [x] 주어진 hook의 책임에 맞도록 코드가 분리가 되었나요?
- [x] 계산함수는 순수함수로 작성이 되었나요?

### 심화과제

- 뷰데이터와 엔티티데이터의 분리에 대한 이해
- 엔티티 -> 리파지토리 -> 유즈케이스 -> UI 계층에 대한 이해

- [x] Component에서 사용되는 Data가 아닌 로직들은 hook으로 옮겨졌나요?
- [x] 주어진 hook의 책임에 맞도록 코드가 분리가 되었나요?
- [x] 계산함수는 순수함수로 작성이 되었나요?
- [x] 특정 Entitiy만 다루는 함수는 분리되어 있나요?
- [x] 특정 Entitiy만 다루는 Component와 UI를 다루는 Component는 분리되어 있나요?
- [x] 데이터 흐름에 맞는 계층구조를 이루고 의존성이 맞게 작성이 되었나요?

## 과제 셀프회고

### 과제에서 좋았던 부분

> 🏊‍♀️ Deep in 함수형 프로그래밍

#### 1. 순수함수
- 코드를 크게 액션, 계산, 데이터로 분리합니다.
- 액션과 계산을 확실히 분리해서 액션을 최소화하고 계산함수를 만들어 관리합니다.
- 계산 함수는 명시적인 입출력마 가지며 어떠한 부수효과도 만들어 내지 않습니다.

#### 2. 불변성
- 계산 함수는 여러 번 실행해도 외부의 영향에 값을 변경하지 않아야 합니다.
- 자바스크립트는 객체나 배열과 같은 값을 다룰 때 원본을 그대로 전달하고 직접 수정할 수 있는 방법을 사용합니다. -> `pass by reference`
- 함수에서 원본값을 직접 수정한다면 메모리상으론 효율적이지만 외부에 영향을 끼치게 됩니다.
- 배열이나 객체의 값을 직접 조작하지 않고 값을 복사 후 수정하여 원본을 건드리지 않는 방법을 사용합니다. -> `pass by value`
- 원본의 값을 복사하여 수정하는 카피 온 라이트 방법을 통해 액션을 계산으로 만들 수 있습니다. -> **얕은 복사**
- 만약 액션을 직접 수정할 수 없다면 방어적 복사 기법을 통해 중첩된 모든 구조를 복사합니다. -> **깊은 복사**

#### 3. 선언적 패턴
- 액션 - 계산 - 데이터로 코드를 분리하여 조합하는 과정에서 함수간의 계층이 생깁니다.
- 계층을 나누고 각 계층을 침범하지 않도록 코드를 작성하다 보면 추상화 벽이 만들어 집니다.
- 이처럼 계층이 견고해지는 구조로 작성하다 보면 상위는 행동 중심의 선언적 패턴이 생기고, 하위에는 데이터 중심의 재사용성과 테스트하기 좋은 코드가 생겨 좋은 설계뱡향의 코드가 만들어 집니다.

### 과제를 하면서 새롭게 알게된 점

> 👯‍♀️ vitest로 커스텀 훅 테스트 코드 작성하기

#### 1. `beforeEach`와 `afterEach`
- 로컬 스트리지를 모킹하여 독립적인 환경을 보장합니다.
- `vi.fn()`을 통해 `getItem`과 `setItem` 메서드를 모킹합니다.

```javascript
  describe('useLocalStorage', () => {
    const key = 'testKey';
    const initialValue = { name: 'Test', quantity: 1 };
  
    beforeEach(() => {
      vi.stubGlobal('localStorage', {
        getItem: vi.fn(),
        setItem: vi.fn(),
      });
    });
  
    afterEach(() => {
      vi.clearAllMocks();
    });
  });
```

#### 2. `renderHook`을 통해 훅 테스트
```javascript
  test('초기값이 올바르게 설정되어야 합니다.', () => {
    (localStorage.getItem as Mock).mockReturnValueOnce(null);
    const { result } = renderHook(() => useLocalStorage(key, initialValue));

    expect(result.current.storedItem).toEqual(initialValue);
    expect(localStorage.getItem).toHaveBeenCalledWith(key);
  });
```

#### 3. `act`를 통해 상태 업데이트 테스트
```javascript
  test('setCartItem 호출 시 상태와 로컬 스토리지가 업데이트 되어야 합니다.', () => {
    const { result } = renderHook(() => useLocalStorage(key, initialValue));

    const newValue = { name: 'Updated', quantity: 3 };
    act(() => {
      result.current.setCartItem(newValue);
    });

    expect(result.current.storedItem).toEqual(newValue);
    expect(localStorage.setItem).toHaveBeenCalledWith(key, JSON.stringify(newValue));
  });
```

### 과제를 진행하면서 아직 애매하게 잘 모르겠다 하는 점, 혹은 뭔가 잘 안되서 아쉬운 것들

> ❓ 문제 상황
- useLocalStorage 커스텀 훅을 만들어 장바구니 로직에 적용하니, 기본과제 테스트 코드에서 오류가 발생
- 테스트 코드에 `act` 과정에서 여러 상태 업데이트를 한번에 처리하여 업데이트 된 상태가 즉시 반영되지 않음

```javascript
  test('제품 수량을 업데이트해야 합니다', () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addToCart(testProduct);
      result.current.updateQuantity(testProduct.id, 5);
    });

    expect(result.current.cart[0].quantity).toBe(5);
  });


  test('합계를 정확하게 계산해야 합니다', () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addToCart(testProduct);
      result.current.updateQuantity(testProduct.id, 2);
      result.current.applyCoupon(testCoupon);
    });

    const total = result.current.calculateTotal();
    expect(total.totalBeforeDiscount).toBe(200);
    expect(total.totalAfterDiscount).toBe(180);
    expect(total.totalDiscount).toBe(20);
  });
```

> ❗️ 문제 해결 시도 방안
- `act`를 각 상태 업데이트로 분리하여 상태 변경을 순차적으로 이룰 수 있도록 테스트 코드 변경

```javascript
  test('제품 수량을 업데이트해야 합니다', () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addToCart(testProduct);
    });

    act(() => {
      result.current.updateQuantity(testProduct.id, 5);
    });
    
    
   test('합계를 정확하게 계산해야 합니다', () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addToCart(testProduct);
    });

    act(() => {
      result.current.updateQuantity(testProduct.id, 2);
    });

    act(() => {
      result.current.applyCoupon(testCoupon);
    });

    const total = result.current.calculateTotal();
    expect(total.totalBeforeDiscount).toBe(200);
    expect(total.totalAfterDiscount).toBe(180);
    expect(total.totalDiscount).toBe(20);
  });
```

> 🤔 문제 해결 방안에 대한 의문점

- 현재 `useLocalStorage`에 `setItem`에서 로컬 스토리지를 초기화 처리를 했는데 왜 오류가 발생할까?
```typescript
  const setCartItem = (product: T | ((prev: T) => T)) => {
    try {
      const itemToStore = product instanceof Function ? product(storedItem) : product;
      setStoredItem(itemToStore);
      window.localStorage.setItem(key, JSON.stringify(itemToStore));
    } catch (error) {
      console.log(error);
    }
  };
```

- 테스트 코드를 수정하지 않고 로컬 스토리지의 상태 변화를 업데이트하는 방법이 없을까?

## 리뷰 받고 싶은 내용이나 궁금한 것에 대한 질문

### 폴더구조 관련
- 어떤 프로젝트를 시작할 때 폴더구조 관련해서 많이 고민하는 편입니다.
- 코치님께서는 코드 컨벤션처럼 폴더구조를 미리 정해두고 그 가이드에 맞춰 프로젝트를 만드시나요?
- 아니면 프로젝트 성격에 맞게 폴더구조를 매일 다르게 하시나요?
