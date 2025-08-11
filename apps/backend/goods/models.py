from django.db import models
from django.utils.translation import gettext_lazy as _
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from api.models import User
from core.mixins import ExtIdMixin
from django_softdelete.models import SoftDeleteModel


class ProductGroup(ExtIdMixin, models.Model):
    name = models.CharField(
        max_length=200, 
        verbose_name=_('Название группы')
    )

    class Meta:
        verbose_name = _('Группа товаров')
        verbose_name_plural = _('Группы товаров')

    def __str__(self):
        return self.name
    

class ProductSubgroup(ExtIdMixin, models.Model):
    group = models.ForeignKey(
        ProductGroup, 
        on_delete=models.CASCADE, 
        related_name='subgroups',
        verbose_name=_('Группа товаров')
    )
    name = models.CharField(
        max_length=200, 
        verbose_name=_('Название подгруппы')
    )
    # Подгруппа закреплена за конкретным product-менеджером
    product_manager = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        limit_choices_to={'role': 'product'},
        related_name='product_subgroups',
        verbose_name=_('Ответственный менеджер'),
        help_text=_('Менеджер, отвечающий за данную подгруппу')
    )

    class Meta:
        verbose_name = _('Подгруппа товаров')
        verbose_name_plural = _('Подгруппы товаров')

    def __str__(self):
        return f"{self.group.name} - {self.name}"
    

class Brand(ExtIdMixin, models.Model):
    name = models.CharField(
        max_length=200, 
        verbose_name=_('Название бренда')
    )
    # Если за бренд закреплён конкретный менеджер:
    product_manager = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        limit_choices_to={'role': 'product'},
        related_name='brands',
        verbose_name=_('Ответственный менеджер за бренд'),
        help_text=_('Менеджер, отвечающий за данный бренд')
    )

    class Meta:
        verbose_name = _('Бренд')
        verbose_name_plural = _('Бренды')

    def __str__(self):
        return self.name
    

class Product(SoftDeleteModel, ExtIdMixin):
    subgroup = models.ForeignKey(
        ProductSubgroup, 
        on_delete=models.CASCADE, 
        related_name='products',
        verbose_name=_('Подгруппа')
    )
    brand = models.ForeignKey(
        Brand,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='products',
        verbose_name=_('Бренд')
    )
    name = models.CharField(
        max_length=200, 
        verbose_name=_('Part number')
    )
    # Переопределение менеджера для конкретного товара:
    product_manager = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        limit_choices_to={'role': 'product'},
        related_name='products',
        verbose_name=_('Ответственный менеджер'),
        help_text=_('Если не указан, используется менеджер бренда или подгруппы')
    )
    
    # Технические параметры товара в формате JSON
    tech_params = models.JSONField(
        default=dict,
        blank=True,
        verbose_name=_('Технические параметры'),
        help_text=_('Технические характеристики товара в формате JSON')
    )
    complex_name = models.CharField(
        max_length=512,
        verbose_name=_('Комплексное наименование'),
        help_text=_('Комплексное наименование товара')
    )
    description = models.TextField(
        blank=True,
        verbose_name=_('Описание'),
        help_text=_('Описание товара')
    )

    class Meta:
        verbose_name = _('Товар')
        verbose_name_plural = _('Товары')

    def __str__(self):
        return self.name

    def get_manager(self):
        """
        Определяет менеджера товара по следующему порядку приоритета:
        1. Если для товара явно указан менеджер, возвращает его.
        2. Если у товара есть бренд и для бренда назначен менеджер, возвращает его.
        3. Иначе возвращает менеджера подгруппы.
        """
        if self.product_manager:
            return self.product_manager
        if self.brand and self.brand.product_manager:
            return self.brand.product_manager
        return self.subgroup.product_manager