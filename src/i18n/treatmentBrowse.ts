import type { Tables } from './index'

const en = {
  heading: 'Explore by skin reading', info: 'Category guide', close: 'Close',
  search: 'Search treatments', placeholder: 'Treatment name or concern',
  saved: 'Saved treatments', sort: 'Sort treatments', defaultSort: 'Default', priceSort: 'Lowest price', nameSort: 'Name',
  grid: 'Visual grid', list: 'Compact list', from: (price: string) => `From ${price}`,
  empty: 'No treatments found', emptyBody: 'Try another category or search, or turn off the saved filter.',
  allGuide: 'Explore six skin-reading categories. Hydration, scar care and contour treatments are also available in All and search.',
  reference: 'Reference starting prices · check options and VAT in details',
}
export const TREATMENT_BROWSE: Tables<typeof en> = {
  en,
  ko: {
    heading: '진단 항목으로 찾아보기', info: '분류 안내', close: '닫기',
    search: '시술 검색', placeholder: '시술명 또는 피부 고민 검색',
    saved: '저장한 시술', sort: '시술 정렬', defaultSort: '기본순', priceSort: '낮은 가격순', nameSort: '이름순',
    grid: '비주얼 그리드', list: '컴팩트 목록', from: (price) => `${price}부터`,
    empty: '해당 시술이 없어요', emptyBody: '다른 카테고리나 검색어를 선택하거나 저장 필터를 해제해 주세요.',
    allGuide: '진단 항목 6개로 찾아볼 수 있어요. 수분·피부결, 흉터, 윤곽 등 별도 목적의 시술도 전체 목록과 검색에서 확인할 수 있습니다.',
    reference: '참고 시작가 · 옵션과 VAT 여부는 상세에서 확인',
  },
  ja: {
    heading: '肌診断の項目から探す', info: '分類ガイド', close: '閉じる',
    search: '施術を検索', placeholder: '施術名や肌の悩みを検索',
    saved: '保存した施術', sort: '施術の並び順', defaultSort: '標準', priceSort: '料金が安い順', nameSort: '名前順',
    grid: '画像グリッド', list: 'コンパクト一覧', from: (price) => `${price}〜`,
    empty: '該当する施術がありません', emptyBody: '分類や検索語を変えるか、保存フィルターを解除してください。',
    allGuide: '肌診断の6項目から探せます。保湿・ニキビ跡・輪郭などの施術も、すべての一覧と検索で確認できます。',
    reference: '参考最低料金 · プランとVATは詳細で確認',
  },
  zh: {
    heading: '按肌肤检测项目查找', info: '分类说明', close: '关闭',
    search: '搜索项目', placeholder: '搜索项目名称或肌肤问题',
    saved: '已收藏项目', sort: '项目排序', defaultSort: '默认', priceSort: '价格从低到高', nameSort: '名称',
    grid: '图片网格', list: '紧凑列表', from: (price) => `${price}起`,
    empty: '没有找到项目', emptyBody: '请选择其他分类或关键词，或关闭收藏筛选。',
    allGuide: '可按6个肌肤检测项目查找。保湿、痘疤、轮廓等项目也可在全部列表和搜索中查看。',
    reference: '参考起价 · 选项及增值税请查看详情',
  },
}
