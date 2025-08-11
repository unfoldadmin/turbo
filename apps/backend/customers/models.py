from django.db import models
from django.utils.translation import gettext_lazy as _
from core.mixins import ExtIdMixin, TimestampsMixin
from django_softdelete.models import SoftDeleteModel


class Company(SoftDeleteModel, ExtIdMixin, TimestampsMixin):
    """Модель для представления компаний-клиентов"""
    
    class CompanyTypeChoices(models.TextChoices):
        NOT_DEFINED = 'not_defined', _('Не определен')
        MANUFACTURER = 'manufacturer', _('Производитель')
        DISTRIBUTOR = 'distributor', _('Дистрибьютор')
        INTEGRATOR = 'integrator', _('Интегратор')
        END_USER = 'end_user', _('Конечный пользователь')
        OTHER = 'other', _('Другое')
    
    class StatusChoices(models.TextChoices):
        NOT_DEFINED = 'not_defined', _('Не определен')
        ACTIVE = 'active', _('Активный')
        POTENTIAL = 'potential', _('Потенциальный')
        INACTIVE = 'inactive', _('Неактивный')
        BLACKLIST = 'blacklist', _('Черный список')
    
    name = models.CharField(
        max_length=255,
        verbose_name=_('Название компании'),
        help_text=_('Полное наименование компании')
    )
    
    short_name = models.CharField(
        max_length=512,
        blank=True,
        null=True,
        verbose_name=_('Краткое название'),
        help_text=_('Краткое название для удобства отображения')
    )
    
    company_type = models.CharField(
        max_length=20,
        choices=CompanyTypeChoices.choices,
        default=CompanyTypeChoices.NOT_DEFINED,
        verbose_name=_('Тип компании')
    )
    
    status = models.CharField(
        max_length=20,
        choices=StatusChoices.choices,
        default=StatusChoices.POTENTIAL,
        verbose_name=_('Статус')
    )
    
    inn = models.CharField(
        max_length=50,
        blank=True,
        verbose_name=_('ИНН'),
        help_text=_('Идентификационный номер налогоплательщика')
    )
    
    ogrn = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        verbose_name=_('ОГРН'),
        help_text=_('Основной государственный регистрационный номер')
    )
    
    legal_address = models.TextField(
        blank=True,
        null=True,
        verbose_name=_('Юридический адрес')
    )
    
    actual_address = models.TextField(
        blank=True,
        null=True,
        verbose_name=_('Фактический адрес')
    )
    
    website = models.URLField(
        blank=True,
        null=True,
        verbose_name=_('Веб-сайт')
    )
    
    phone = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name=_('Телефон')
    )
    
    email = models.EmailField(
        blank=True,
        null=True,
        verbose_name=_('Email')
    )
    
    industry = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        verbose_name=_('Отрасль'),
        help_text=_('Основная отрасль деятельности')
    )
    
    annual_revenue = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_('Годовой оборот'),
        help_text=_('Приблизительный годовой оборот в рублях')
    )
    
    sales_manager = models.ForeignKey(
        'api.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        limit_choices_to={'role': 'sales'},
        related_name='managed_companies',
        verbose_name=_('Ответственный менеджер'),
        help_text=_('Sales менеджер, ответственный за данную компанию')
    )
    
    notes = models.TextField(
        blank=True,
        null=True,
        verbose_name=_('Заметки'),
        help_text=_('Дополнительная информация о компании')
    )
    
    class Meta:
        verbose_name = _('Компания')
        verbose_name_plural = _('Компании')
        ordering = ['name']
    
    def __str__(self):
        return self.short_name or self.name
    
    @property
    def indexed_name(self) -> str:
        return f"company_{self.id}"
    
    def get_primary_contact(self):
        """Возвращает основное контактное лицо компании"""
        return self.employees.filter(is_primary_contact=True).first()
    
    def get_active_employees(self):
        """Возвращает активных сотрудников компании"""
        return self.employees.filter(status='active') 