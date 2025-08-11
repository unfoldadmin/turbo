from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal
from core.mixins import ExtIdMixin


def rfq_file_upload_path(instance, filename):
    """Генерирует путь для загрузки файлов RFQ"""
    return f'rfq/{instance.rfq_item.rfq.id}/items/{instance.rfq_item.id}/{filename}'


class Currency(models.Model):
    """Модель для валют"""
    
    code = models.CharField(
        max_length=3,
        unique=True,
        verbose_name=_('Код валюты'),
        help_text=_('ISO код валюты (USD, RUB, CNY)')
    )
    
    name = models.CharField(
        max_length=50,
        verbose_name=_('Название валюты')
    )
    
    symbol = models.CharField(
        max_length=5,
        verbose_name=_('Символ валюты'),
        help_text=_('$, ₽, ¥')
    )
    
    exchange_rate_to_rub = models.DecimalField(
        max_digits=10,
        decimal_places=4,
        default=1,
        verbose_name=_('Курс к рублю'),
        help_text=_('Текущий курс валюты к рублю')
    )
    
    is_active = models.BooleanField(
        default=True,
        verbose_name=_('Активна')
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name=_('Обновлено')
    )
    
    class Meta:
        verbose_name = _('Валюта')
        verbose_name_plural = _('Валюты')
        ordering = ['code']
    
    def __str__(self):
        return f"{self.code} ({self.symbol})"


class RFQ(ExtIdMixin, models.Model):
    """Основная модель запроса цен (Request for Quotation)"""
    
    class StatusChoices(models.TextChoices):
        DRAFT = 'draft', _('Черновик')
        SUBMITTED = 'submitted', _('Отправлен')
        IN_PROGRESS = 'in_progress', _('В работе')
        COMPLETED = 'completed', _('Завершен')
        CANCELLED = 'cancelled', _('Отменен')
    
    class PriorityChoices(models.TextChoices):
        LOW = 'low', _('Низкий')
        MEDIUM = 'medium', _('Средний')
        HIGH = 'high', _('Высокий')
        URGENT = 'urgent', _('Срочный')
    
    number = models.CharField(
        max_length=50,
        unique=True,
        verbose_name=_('Номер RFQ'),
        help_text=_('Уникальный номер запроса')
    )
    
    title = models.CharField(
        max_length=200,
        verbose_name=_('Название запроса'),
        help_text=_('Краткое описание запроса')
    )
    
    company = models.ForeignKey(
        'customers.Company',
        on_delete=models.CASCADE,
        related_name='rfqs',
        verbose_name=_('Компания-заказчик')
    )
    
    contact_person = models.ForeignKey(
        'persons.Person',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='rfqs',
        verbose_name=_('Контактное лицо'),
        help_text=_('Контактное лицо со стороны заказчика')
    )
    
    sales_manager = models.ForeignKey(
        'api.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_rfqs',
        limit_choices_to={'role': 'sales'},
        verbose_name=_('Sales менеджер'),
        help_text=_('Менеджер, создавший запрос')
    )
    
    status = models.CharField(
        max_length=20,
        choices=StatusChoices.choices,
        default=StatusChoices.DRAFT,
        verbose_name=_('Статус')
    )
    
    priority = models.CharField(
        max_length=20,
        choices=PriorityChoices.choices,
        default=PriorityChoices.MEDIUM,
        verbose_name=_('Приоритет')
    )
    
    description = models.TextField(
        blank=True,
        verbose_name=_('Описание'),
        help_text=_('Подробное описание запроса')
    )
    
    deadline = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_('Крайний срок'),
        help_text=_('Крайний срок подготовки предложения')
    )
    
    delivery_address = models.TextField(
        blank=True,
        verbose_name=_('Адрес доставки'),
        help_text=_('Желаемый адрес доставки товаров')
    )
    
    payment_terms = models.CharField(
        max_length=200,
        blank=True,
        verbose_name=_('Условия оплаты'),
        help_text=_('Предпочтительные условия оплаты')
    )
    
    delivery_terms = models.CharField(
        max_length=200,
        blank=True,
        verbose_name=_('Условия поставки'),
        help_text=_('Предпочтительные условия поставки')
    )
    
    notes = models.TextField(
        blank=True,
        verbose_name=_('Заметки'),
        help_text=_('Внутренние заметки и комментарии')
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_('Дата создания')
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name=_('Дата обновления')
    )
    
    class Meta:
        verbose_name = _('Запрос цен (RFQ)')
        verbose_name_plural = _('Запросы цен (RFQ)')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"RFQ {self.number} - {self.title}"
    
    @property
    def indexed_name(self) -> str:
        return f"rfq_{self.id}"
    
    def save(self, *args, **kwargs):
        """Автоматическая генерация номера RFQ"""
        if not self.number:
            # Генерируем номер вида RFQ-YYYY-0001
            from django.utils import timezone
            year = timezone.now().year
            last_rfq = RFQ.objects.filter(
                number__startswith=f'RFQ-{year}-'
            ).order_by('-number').first()
            
            if last_rfq:
                last_num = int(last_rfq.number.split('-')[-1])
                new_num = last_num + 1
            else:
                new_num = 1
            
            self.number = f'RFQ-{year}-{new_num:04d}'
        
        super().save(*args, **kwargs)


class RFQItem(ExtIdMixin, models.Model):
    """Строчка запроса цен"""
    
    rfq = models.ForeignKey(
        RFQ,
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name=_('RFQ')
    )
    
    line_number = models.PositiveIntegerField(
        verbose_name=_('Номер строки'),
        help_text=_('Порядковый номер строки в запросе')
    )
    
    product = models.ForeignKey(
        'goods.Product',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='rfq_items',
        verbose_name=_('Товар'),
        help_text=_('Товар из базы (если выбран)')
    )
    
    # Поля для нового товара (если товар не из базы)
    product_name = models.CharField(
        max_length=200,
        blank=True,
        verbose_name=_('Название товара'),
        help_text=_('Название товара (если не из базы)')
    )
    
    manufacturer = models.CharField(
        max_length=200,
        blank=True,
        verbose_name=_('Производитель'),
        help_text=_('Производитель товара')
    )
    
    part_number = models.CharField(
        max_length=200,
        blank=True,
        verbose_name=_('Артикул'),
        help_text=_('Партномер или артикул товара')
    )
    
    quantity = models.PositiveIntegerField(
        verbose_name=_('Количество'),
        help_text=_('Требуемое количество')
    )
    
    unit = models.CharField(
        max_length=20,
        default='шт',
        verbose_name=_('Единица измерения'),
        help_text=_('Единица измерения (шт, кг, м и т.д.)')
    )
    
    specifications = models.TextField(
        blank=True,
        verbose_name=_('Технические требования'),
        help_text=_('Подробные технические требования к товару')
    )
    
    comments = models.TextField(
        blank=True,
        verbose_name=_('Комментарии'),
        help_text=_('Дополнительные комментарии к строке')
    )
    
    is_new_product = models.BooleanField(
        default=False,
        verbose_name=_('Новый товар'),
        help_text=_('Товар не из базы, требует создания product менеджером')
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_('Дата создания')
    )
    
    class Meta:
        verbose_name = _('Строка RFQ')
        verbose_name_plural = _('Строки RFQ')
        ordering = ['rfq', 'line_number']
        unique_together = [['rfq', 'line_number']]
    
    def __str__(self):
        product_name = self.product.name if self.product else self.product_name
        return f"{self.rfq.number} - {self.line_number}: {product_name}"
    
    @property
    def indexed_name(self) -> str:
        return f"rfq_item_{self.id}"


class RFQItemFile(models.Model):
    """Файлы, прикрепленные к строке RFQ (фото, даташиты и т.д.)"""
    
    class FileTypeChoices(models.TextChoices):
        PHOTO = 'photo', _('Фотография')
        DATASHEET = 'datasheet', _('Даташит')
        SPECIFICATION = 'specification', _('Спецификация')
        DRAWING = 'drawing', _('Чертеж')
        OTHER = 'other', _('Другое')
    
    rfq_item = models.ForeignKey(
        RFQItem,
        on_delete=models.CASCADE,
        related_name='files',
        verbose_name=_('Строка RFQ')
    )
    
    file = models.FileField(
        upload_to=rfq_file_upload_path,
        verbose_name=_('Файл')
    )
    
    file_type = models.CharField(
        max_length=20,
        choices=FileTypeChoices.choices,
        default=FileTypeChoices.OTHER,
        verbose_name=_('Тип файла')
    )
    
    description = models.CharField(
        max_length=200,
        blank=True,
        verbose_name=_('Описание файла')
    )
    
    uploaded_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_('Дата загрузки')
    )
    
    class Meta:
        verbose_name = _('Файл строки RFQ')
        verbose_name_plural = _('Файлы строк RFQ')
        ordering = ['uploaded_at']
    
    def __str__(self):
        return f"{self.rfq_item} - {self.file.name}"


class Quotation(ExtIdMixin, models.Model):
    """Предложение от product менеджера в ответ на RFQ"""
    
    class StatusChoices(models.TextChoices):
        DRAFT = 'draft', _('Черновик')
        SUBMITTED = 'submitted', _('Отправлено')
        ACCEPTED = 'accepted', _('Принято')
        REJECTED = 'rejected', _('Отклонено')
        EXPIRED = 'expired', _('Просрочено')
    
    rfq = models.ForeignKey(
        RFQ,
        on_delete=models.CASCADE,
        related_name='quotations',
        verbose_name=_('RFQ')
    )
    
    number = models.CharField(
        max_length=50,
        unique=True,
        verbose_name=_('Номер предложения'),
        help_text=_('Уникальный номер предложения')
    )
    
    product_manager = models.ForeignKey(
        'api.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='quotations',
        limit_choices_to={'role': 'product'},
        verbose_name=_('Product менеджер'),
        help_text=_('Менеджер, создавший предложение')
    )
    
    status = models.CharField(
        max_length=20,
        choices=StatusChoices.choices,
        default=StatusChoices.DRAFT,
        verbose_name=_('Статус')
    )
    
    title = models.CharField(
        max_length=200,
        verbose_name=_('Название предложения')
    )
    
    currency = models.ForeignKey(
        Currency,
        on_delete=models.PROTECT,
        related_name='quotations',
        verbose_name=_('Валюта предложения')
    )
    
    description = models.TextField(
        blank=True,
        verbose_name=_('Описание предложения')
    )
    
    valid_until = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_('Действительно до'),
        help_text=_('Дата истечения предложения')
    )
    
    delivery_time = models.CharField(
        max_length=200,
        blank=True,
        verbose_name=_('Срок поставки'),
        help_text=_('Предполагаемый срок поставки')
    )
    
    payment_terms = models.CharField(
        max_length=200,
        blank=True,
        verbose_name=_('Условия оплаты')
    )
    
    delivery_terms = models.CharField(
        max_length=200,
        blank=True,
        verbose_name=_('Условия поставки')
    )
    
    notes = models.TextField(
        blank=True,
        verbose_name=_('Заметки'),
        help_text=_('Внутренние заметки к предложению')
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_('Дата создания')
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name=_('Дата обновления')
    )
    
    class Meta:
        verbose_name = _('Предложение')
        verbose_name_plural = _('Предложения')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Quote {self.number} for {self.rfq.number}"
    
    @property
    def indexed_name(self) -> str:
        return f"quotation_{self.id}"
    
    def save(self, *args, **kwargs):
        """Автоматическая генерация номера предложения"""
        if not self.number:
            # Генерируем номер вида QUO-YYYY-0001
            from django.utils import timezone
            year = timezone.now().year
            last_quotation = Quotation.objects.filter(
                number__startswith=f'QUO-{year}-'
            ).order_by('-number').first()
            
            if last_quotation:
                last_num = int(last_quotation.number.split('-')[-1])
                new_num = last_num + 1
            else:
                new_num = 1
            
            self.number = f'QUO-{year}-{new_num:04d}'
        
        super().save(*args, **kwargs)
    
    @property
    def total_amount(self):
        """Общая сумма предложения"""
        return sum(item.total_price for item in self.items.all())


class QuotationItem(ExtIdMixin, models.Model):
    """Строчка предложения"""
    
    quotation = models.ForeignKey(
        Quotation,
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name=_('Предложение')
    )
    
    rfq_item = models.ForeignKey(
        RFQItem,
        on_delete=models.CASCADE,
        related_name='quotation_items',
        verbose_name=_('Строка RFQ'),
        help_text=_('Соответствующая строка из RFQ')
    )
    
    product = models.ForeignKey(
        'goods.Product',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='quotation_items',
        verbose_name=_('Товар'),
        help_text=_('Предлагаемый товар')
    )
    
    # Поля для нового товара (если создается новый товар)
    proposed_product_name = models.CharField(
        max_length=200,
        blank=True,
        verbose_name=_('Предлагаемое название'),
        help_text=_('Название предлагаемого товара')
    )
    
    proposed_manufacturer = models.CharField(
        max_length=200,
        blank=True,
        verbose_name=_('Предлагаемый производитель')
    )
    
    proposed_part_number = models.CharField(
        max_length=200,
        blank=True,
        verbose_name=_('Предлагаемый артикул')
    )
    
    quantity = models.PositiveIntegerField(
        verbose_name=_('Количество'),
        help_text=_('Предлагаемое количество')
    )
    
    unit_cost_price = models.DecimalField(
        max_digits=15,
        decimal_places=4,
        verbose_name=_('Закупочная цена за единицу'),
        help_text=_('Закупочная стоимость товара за единицу')
    )
    
    cost_markup_percent = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('20.00'),
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name=_('Процент наценки'),
        help_text=_('Процент наценки на закупочную цену')
    )
    
    unit_price = models.DecimalField(
        max_digits=15,
        decimal_places=4,
        verbose_name=_('Цена за единицу'),
        help_text=_('Итоговая цена за единицу с наценкой')
    )
    
    delivery_time = models.CharField(
        max_length=200,
        blank=True,
        verbose_name=_('Срок поставки'),
        help_text=_('Срок поставки для данной позиции')
    )
    
    notes = models.TextField(
        blank=True,
        verbose_name=_('Заметки к позиции')
    )
    
    class Meta:
        verbose_name = _('Строка предложения')
        verbose_name_plural = _('Строки предложения')
        ordering = ['quotation', 'rfq_item__line_number']
    
    def __str__(self):
        product_name = self.product.name if self.product else self.proposed_product_name
        return f"{self.quotation.number} - {product_name}"
    
    @property
    def indexed_name(self) -> str:
        return f"quotation_item_{self.id}"
    
    def save(self, *args, **kwargs):
        """Автоматический расчет цены с наценкой"""
        if self.unit_cost_price and self.cost_markup_percent is not None:
            markup_amount = self.unit_cost_price * (self.cost_markup_percent / Decimal('100'))
            self.unit_price = self.unit_cost_price + markup_amount
        super().save(*args, **kwargs)
    
    @property
    def total_price(self):
        """Общая цена за позицию"""
        return self.unit_price * self.quantity
    
    @property
    def total_cost_price(self):
        """Общая закупочная цена за позицию"""
        return self.unit_cost_price * self.quantity
    
    @property
    def markup_amount(self):
        """Сумма наценки"""
        return self.total_price - self.total_cost_price 