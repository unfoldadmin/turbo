from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.exceptions import ValidationError
from core.mixins import ExtIdMixin, TimestampsMixin


class Invoice(ExtIdMixin, TimestampsMixin, models.Model):
    """Универсальный счет с типом на закупку или продажу"""
    
    class InvoiceType(models.TextChoices):
        PURCHASE = "purchase", _("Закупка")
        SALE = "sale", _("Продажа")

    class SaleType(models.TextChoices):
        STOCK = "stock", _("Со склада")
        ORDER = "order", _("Под заказ")

    class Currency(models.TextChoices):
        RUB = "RUB", _("Рубли")
        USD = "USD", _("Доллары США")
        CNY = "CNY", _("Китайские юани")

    invoice_number = models.CharField(
        max_length=50, unique=True, verbose_name=_("Номер счета")
    )
    invoice_date = models.DateField(verbose_name=_("Дата счета"), db_index=True)
    company = models.ForeignKey(
        'customers.Company', on_delete=models.PROTECT, verbose_name=_("Компания")
    )
    invoice_type = models.CharField(
        max_length=20,
        choices=InvoiceType.choices,
        default=InvoiceType.PURCHASE,
        verbose_name=_("Тип счета"),
        db_index=True,
    )
    sale_type = models.CharField(
        max_length=20,
        choices=SaleType.choices,
        null=True,
        blank=True,
        verbose_name=_("Тип продажи"),
        db_index=True,
    )
    currency = models.CharField(
        max_length=3,
        choices=Currency.choices,
        default=Currency.RUB,
        verbose_name=_("Валюта"),
    )

    class Meta:
        verbose_name = _("Счет")
        verbose_name_plural = _("Счета")
        ordering = ["-invoice_date"]
        indexes = [
            # Композитный индекс для частых запросов по типу счета и типу продажи
            models.Index(fields=['invoice_type', 'sale_type']),
        ]

    def clean(self):
        # Проверка, что тип продажи указан только для счетов продажи
        if self.invoice_type != self.InvoiceType.SALE and self.sale_type:
            raise ValidationError({
                'sale_type': _('Тип продажи может быть указан только для счетов продажи')
            })
        # Проверка, что для счетов продажи указан тип продажи
        if self.invoice_type == self.InvoiceType.SALE and not self.sale_type:
            raise ValidationError({
                'sale_type': _('Необходимо указать тип продажи для счетов продажи')
            })
        super().clean()

    def save(self, *args, **kwargs):
        self.full_clean()  # Вызываем валидацию перед сохранением
        super().save(*args, **kwargs)

    def __str__(self):
        base_str = f"{self.invoice_number} ({self.get_invoice_type_display()}) - {self.currency}"
        if self.invoice_type == self.InvoiceType.SALE and self.sale_type:
            return f"{base_str} - {self.get_sale_type_display()}"
        return base_str

    @property
    def total_amount(self):
        """Общая сумма счета"""
        return sum(line.total_price for line in self.lines.all())


class InvoiceLine(ExtIdMixin, TimestampsMixin, models.Model):
    """Строка счета"""

    invoice = models.ForeignKey(
        Invoice, on_delete=models.CASCADE, related_name="lines", verbose_name=_("Счет")
    )
    product = models.ForeignKey(
        'goods.Product', on_delete=models.PROTECT, verbose_name=_("Товар")
    )
    quantity = models.PositiveIntegerField(verbose_name=_("Количество"))
    price = models.DecimalField(
        max_digits=10, decimal_places=2, verbose_name=_("Цена в валюте счета")
    )

    class Meta:
        verbose_name = _("Строка в счете")
        verbose_name_plural = _("Строки в счетах")

    def __str__(self):
        return f"{self.product} - {self.quantity} x {self.price} {self.invoice.currency}"

    @property
    def total_price(self):
        """Общая стоимость строки"""
        return self.quantity * self.price