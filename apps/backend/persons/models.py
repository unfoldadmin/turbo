from django.db import models
from django.utils.translation import gettext_lazy as _
from core.mixins import ExtIdMixin


class Person(ExtIdMixin, models.Model):
    """Модель для представления реальных людей, работающих в компаниях"""
    
    class StatusChoices(models.TextChoices):
        ACTIVE = 'active', _('Активный')
        INACTIVE = 'inactive', _('Неактивный')
        SUSPENDED = 'suspended', _('Приостановлен')
    
    company = models.ForeignKey(
        'customers.Company',
        on_delete=models.CASCADE,
        related_name='employees',
        verbose_name=_('Компания'),
        help_text=_('Компания, в которой работает человек')
    )
    
    first_name = models.CharField(
        max_length=100,
        verbose_name=_('Имя')
    )
    
    last_name = models.CharField(
        max_length=100,
        verbose_name=_('Фамилия')
    )
    
    middle_name = models.CharField(
        max_length=100,
        blank=True,
        verbose_name=_('Отчество')
    )
    
    email = models.EmailField(
        unique=True,
        verbose_name=_('Email'),
        help_text=_('Рабочий email адрес')
    )
    
    phone = models.CharField(
        max_length=20,
        blank=True,
        verbose_name=_('Телефон'),
        help_text=_('Рабочий телефон')
    )
    
    position = models.CharField(
        max_length=200,
        blank=True,
        verbose_name=_('Должность'),
        help_text=_('Должность в компании')
    )
    
    department = models.CharField(
        max_length=200,
        blank=True,
        verbose_name=_('Отдел'),
        help_text=_('Отдел или подразделение')
    )
    
    status = models.CharField(
        max_length=20,
        choices=StatusChoices.choices,
        default=StatusChoices.ACTIVE,
        verbose_name=_('Статус')
    )
    
    is_primary_contact = models.BooleanField(
        default=False,
        verbose_name=_('Основной контакт'),
        help_text=_('Является ли основным контактным лицом в компании')
    )
    
    notes = models.TextField(
        blank=True,
        verbose_name=_('Заметки'),
        help_text=_('Дополнительная информация о контакте')
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
        verbose_name = _('Контактное лицо')
        verbose_name_plural = _('Контактные лица')
        ordering = ['company', 'last_name', 'first_name']
        unique_together = [['company', 'email']]
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.company})"
    
    def get_full_name(self):
        """Возвращает полное имя контакта"""
        parts = [self.last_name, self.first_name]
        if self.middle_name:
            parts.append(self.middle_name)
        return ' '.join(parts)
    
    @property
    def indexed_name(self) -> str:
        return f"person_{self.id}" 