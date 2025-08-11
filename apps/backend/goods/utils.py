"""
Утилиты для транслитерации и работы с поиском
"""
import re


class TransliterationUtils:
    """Утилита для конвертации между русской и латинской раскладками"""
    
    # Карта соответствия клавиш русской и латинской раскладок
    RU_TO_EN = {
        'а': 'f', 'б': ',', 'в': 'd', 'г': 'u', 'д': 'l', 'е': 't', 'ё': '`',
        'ж': ';', 'з': 'p', 'и': 'b', 'й': 'q', 'к': 'r', 'л': 'k', 'м': 'v',
        'н': 'y', 'о': 'j', 'п': 'g', 'р': 'h', 'с': 'c', 'т': 'n', 'у': 'e',
        'ф': 'a', 'х': '[', 'ц': 'w', 'ч': 'x', 'ш': 'i', 'щ': 'o', 'ъ': ']',
        'ы': 's', 'ь': 'm', 'э': "'", 'ю': '.', 'я': 'z',
        'А': 'F', 'Б': '<', 'В': 'D', 'Г': 'U', 'Д': 'L', 'Е': 'T', 'Ё': '~',
        'Ж': ':', 'З': 'P', 'И': 'B', 'Й': 'Q', 'К': 'R', 'Л': 'K', 'М': 'V',
        'Н': 'Y', 'О': 'J', 'П': 'G', 'Р': 'H', 'С': 'C', 'Т': 'N', 'У': 'E',
        'Ф': 'A', 'Х': '{', 'Ц': 'W', 'Ч': 'X', 'Ш': 'I', 'Щ': 'O', 'Ъ': '}',
        'Ы': 'S', 'Ь': 'M', 'Э': '"', 'Ю': '>', 'Я': 'Z'
    }
    
    # Обратная карта
    EN_TO_RU = {v: k for k, v in RU_TO_EN.items()}
    
    # Семантическая карта транслитерации (как буквы воспринимаются пользователем)
    RU_TO_EN_SEMANTIC = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
        'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
        'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
        'ф': 'f', 'х': 'h', 'ц': 'c', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '',
        'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
        'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'YO',
        'Ж': 'ZH', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M',
        'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
        'Ф': 'F', 'Х': 'H', 'Ц': 'C', 'Ч': 'CH', 'Ш': 'SH', 'Щ': 'SCH', 'Ъ': '',
        'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'YU', 'Я': 'YA'
    }
    
    # Обратная семантическая карта
    EN_TO_RU_SEMANTIC = {v: k for k, v in RU_TO_EN_SEMANTIC.items() if v}
    
    @classmethod
    def is_cyrillic(cls, text: str) -> bool:
        """Проверяет, содержит ли текст кириллические символы"""
        return bool(re.search(r'[а-яёА-ЯЁ]', text))
    
    @classmethod
    def is_latin(cls, text: str) -> bool:
        """Проверяет, содержит ли текст латинские символы"""
        return bool(re.search(r'[a-zA-Z]', text))
    
    @classmethod
    def looks_like_part_number(cls, text: str) -> bool:
        """Проверяет, похож ли текст на part number (содержит цифры, дефисы, подчеркивания)"""
        return bool(re.search(r'[0-9\-_]', text))
    
    @classmethod
    def ru_to_en(cls, text: str) -> str:
        """Конвертирует текст с русской раскладки на английскую"""
        if not text:
            return text
        return ''.join(cls.RU_TO_EN.get(char, char) for char in text)
    
    @classmethod
    def en_to_ru(cls, text: str) -> str:
        """Конвертирует текст с английской раскладки на русскую"""
        if not text:
            return text
        return ''.join(cls.EN_TO_RU.get(char, char) for char in text)
    
    @classmethod
    def ru_to_en_semantic(cls, text: str) -> str:
        """Конвертирует текст с русской на английскую семантически"""
        if not text:
            return text
        return ''.join(cls.RU_TO_EN_SEMANTIC.get(char, char) for char in text)
    
    @classmethod
    def en_to_ru_semantic(cls, text: str) -> str:
        """Конвертирует текст с английской на русскую семантически"""
        if not text:
            return text
        return ''.join(cls.EN_TO_RU_SEMANTIC.get(char, char) for char in text)
    
    @classmethod
    def get_transliterated_variants(cls, text: str, smart_filter: bool = True) -> list:
        """
        Получает все варианты транслитерации для текста
        
        Args:
            text: Исходный текст
            smart_filter: Включить умную фильтрацию для кириллических запросов
        """
        if not text:
            return [text]
        
        variants = [text]
        
        # Для кириллического текста применяем умную фильтрацию
        if smart_filter and cls.is_cyrillic(text):
            # Семантическая транслитерация всегда добавляется
            en_semantic_variant = cls.ru_to_en_semantic(text)
            if en_semantic_variant != text:
                variants.append(en_semantic_variant)
            
            # Раскладочную транслитерацию добавляем только если:
            # 1. Запрос не похож на part number (нет цифр/дефисов)
            # 2. Или результат раскладочной транслитерации не содержит только латинские буквы
            en_variant = cls.ru_to_en(text)
            if en_variant != text:
                # Если оригинальный запрос похож на part number, исключаем раскладочную транслитерацию
                if not cls.looks_like_part_number(text):
                    variants.append(en_variant)
                # Или если результат не выглядит как чисто латинский текст
                elif not (cls.is_latin(en_variant) and not cls.is_cyrillic(en_variant)):
                    variants.append(en_variant)
        else:
            # Для не-кириллического текста или без умной фильтрации - старая логика
            # Пробуем конвертировать как русский -> английский (раскладка клавиатуры)
            en_variant = cls.ru_to_en(text)
            if en_variant != text:
                variants.append(en_variant)
            
            # Пробуем конвертировать как английский -> русский (раскладка клавиатуры)
            ru_variant = cls.en_to_ru(text)
            if ru_variant != text:
                variants.append(ru_variant)
            
            # Пробуем семантическую конвертацию русский -> английский
            en_semantic_variant = cls.ru_to_en_semantic(text)
            if en_semantic_variant != text:
                variants.append(en_semantic_variant)
            
            # Пробуем семантическую конвертацию английский -> русский
            ru_semantic_variant = cls.en_to_ru_semantic(text)
            if ru_semantic_variant != text:
                variants.append(ru_semantic_variant)
        
        return list(set(variants))  # Убираем дубликаты
    
    @classmethod
    def create_search_text(cls, *texts) -> str:
        """Создает текст для поиска со всеми вариантами транслитерации"""
        all_variants = []
        
        for text in texts:
            if text:
                all_variants.extend(cls.get_transliterated_variants(str(text), smart_filter=False))
        
        return ' '.join(all_variants)


def prepare_search_query(query: str) -> dict:
    """
    Подготавливает поисковый запрос с приоритизированными вариантами транслитерации
    
    Returns:
        dict: {
            'priority_variants': список приоритетных вариантов (оригинал + семантика),
            'fallback_variants': список запасных вариантов (раскладка клавиатуры),
            'all_variants': все варианты для совместимости
        }
    """
    if not query:
        return {
            'priority_variants': [query],
            'fallback_variants': [],
            'all_variants': [query]
        }
    
    # Разбиваем запрос на слова
    words = query.split()
    priority_variants = [query]  # Всегда включаем оригинал
    fallback_variants = []
    
    for word in words:
        if TransliterationUtils.is_cyrillic(word):
            # Для кириллических слов добавляем семантическую транслитерацию в приоритет
            semantic_variant = TransliterationUtils.ru_to_en_semantic(word)
            if semantic_variant != word:
                # Заменяем слово в оригинальном запросе
                semantic_query = query.replace(word, semantic_variant)
                priority_variants.append(semantic_query)
            
            # Раскладочную транслитерацию добавляем в запасные варианты
            keyboard_variant = TransliterationUtils.ru_to_en(word)
            if keyboard_variant != word and TransliterationUtils.looks_like_part_number(query):
                # Для part number-подобных запросов исключаем раскладочную транслитерацию
                pass
            elif keyboard_variant != word:
                keyboard_query = query.replace(word, keyboard_variant)
                fallback_variants.append(keyboard_query)
    
    # Убираем дубликаты
    priority_variants = list(set(priority_variants))
    fallback_variants = list(set(fallback_variants))
    
    # Все варианты для обратной совместимости
    all_variants = priority_variants + fallback_variants
    
    return {
        'priority_variants': priority_variants,
        'fallback_variants': fallback_variants,
        'all_variants': list(set(all_variants))
    } 