from typing import Any, Dict

from django_meilisearch_indexer.indexers import MeilisearchModelIndexer

from goods.models import Product
from goods.utils import TransliterationUtils


class ProductIndexer(MeilisearchModelIndexer[Product]):
    """Индексер для товаров в MeiliSearch."""

    MODEL_CLASS = Product
    PRIMARY_KEY = "id"
    SETTINGS = {
        "filterableAttributes": [
            "subgroup_id",
            "subgroup_name",
            "brand_id", 
            "brand_name",
            "product_manager_id",
            "product_manager_name",
            "group_id",
            "group_name",
            "complex_name",
            "description"
        ],
        "searchableAttributes": [
            "name",  # Высший приоритет - точное название товара
            "brand_name",  # Второй приоритет - название бренда
            "subgroup_name",  # Третий приоритет - подгруппа
            "group_name",  # Четвертый приоритет - группа
            "product_manager_name",  # Пятый приоритет - менеджер
            "tech_params_searchable",  # Шестой приоритет - технические параметры
            "transliterated_search",  # Низший приоритет - транслитерированный поиск
            "complex_name",
            "description"
        ],
        "rankingRules": [
            "words",  # Количество найденных слов из запроса
            "typo",   # Количество опечаток
            "proximity",  # Близость слов друг к другу
            "attribute",  # Приоритет атрибутов (порядок в searchableAttributes)
            "sort",   # Сортировка (если указана)
            "exactness"  # Точность совпадения
        ],
        "sortableAttributes": [
            "name",
            "brand_name",
            "subgroup_name",
            "group_name",
            "complex_name",
            "description"
        ],
        "displayedAttributes": [
            "id",
            "name",
            "brand_name",
            "subgroup_name",
            "group_name",
            "product_manager_name",
            "tech_params",
            "complex_name",
            "description"
        ],
        "stopWords": [],  # Пустой список стоп-слов для технических терминов
        "synonyms": {},   # Можно добавить синонимы в будущем
        "distinctAttribute": None,  # Не группируем результаты
        "typoTolerance": {
            "enabled": True,
            "minWordSizeForTypos": {
                "oneTypo": 4,   # Одна опечатка для слов от 4 символов
                "twoTypos": 8   # Две опечатки для слов от 8 символов
            },
            "disableOnWords": [],  # Не отключаем проверку опечаток для конкретных слов
            "disableOnAttributes": ["transliterated_search"]  # Отключаем проверку опечаток для транслитерированного поиска
        },
        "faceting": {
            "maxValuesPerFacet": 100
        },
        "pagination": {
            "maxTotalHits": 1000
        }
    }

    @classmethod
    def build_object(cls, product: Product) -> Dict[str, Any]:
        # Получаем менеджера товара
        manager = product.get_manager()
        
        # Создаем строку для поиска по техническим параметрам
        tech_params_searchable = ""
        if product.tech_params:
            # Собираем все значения из JSON в одну строку для поиска
            tech_params_searchable = " ".join(
                str(value) for value in product.tech_params.values()
                if value is not None
            )
        
        # Создаем поле для транслитерированного поиска
        # Используем режим без умной фильтрации для индекса, чтобы сохранить все варианты
        transliterated_search = TransliterationUtils.create_search_text(
            product.name,
            product.brand.name if product.brand else "",
            product.subgroup.name,
            product.subgroup.group.name,
            manager.username if manager else "",
            tech_params_searchable
        )
        
        return {
            "id": product.id,
            "name": product.name,
            "brand_id": product.brand.id if product.brand else None,
            "brand_name": product.brand.name if product.brand else "",
            "subgroup_id": product.subgroup.id,
            "subgroup_name": product.subgroup.name,
            "group_id": product.subgroup.group.id,
            "group_name": product.subgroup.group.name,
            "product_manager_id": manager.id if manager else None,
            "product_manager_name": manager.username if manager else "",
            "tech_params": product.tech_params,
            "tech_params_searchable": tech_params_searchable,
            "transliterated_search": transliterated_search,
        }

    @classmethod
    def index_name(cls) -> str:
        return "products" 