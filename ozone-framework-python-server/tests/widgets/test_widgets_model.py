import uuid
from django.test import TestCase

from domain_mappings.models import DomainMapping
from people.models import Person, PersonWidgetDefinition
from widgets.models import WidgetDefinition, WidgetDefIntent, WidgetDefIntentDataTypes
from intents.models import IntentDataTypes

payload = {
    "version": 1,
    "visible": True,
    "image_url_medium": "https://emoji.slack-edge.com/T045BEDPN/fistbump/7592b191dc43cce2.gif",
    "image_url_small": "https://emoji.slack-edge.com/T045BEDPN/fistbump/7592b191dc43cce2.gif",
    "singleton": False,
    "width": 200,
    "widget_version": "1",
    "height": 200,
    "widget_url": "https://emoji.slack-edge.com/T045BEDPN/fistbump/7592b191dc43cce2.gif",
    "widget_guid": uuid.uuid4,
    "display_name": "Test Widget",
    "background": False,
    "universal_name": "test_widget_x",
    "descriptor_url": "Description for a url",
    "description": "Description...",
    "mobile_ready": False,
    "intents": {
        "send": [
            {
                "action": "act",
                "dataTypes": [
                    "type-1",
                    "type-2"
                ]
            },
            {
                "action": "another",
                "dataTypes": [
                    "another_type"
                ]
            }
        ],
        "receive": [
            {
                "action": "act",
                "dataTypes": [
                    "type-1",
                    "type-2"
                ]
            },
            {
                "action": "another",
                "dataTypes": [
                    "another_type"
                ]
            }
        ]
    }
}


class WidgetModelTests(TestCase):
    fixtures = [
        'tests/people/fixtures/default_test_people.json',
        'tests/owf_groups/fixtures/default_test_groups.json',
        'tests/owf_groups/fixtures/group_people_mappings.json',
        'tests/widgets/fixtures/default_test_widgets.json',
        'tests/widgets/fixtures/widgets_test_mappings.json'
    ]

    def test_create(self):
        # create - new item does not exists yet.
        instance = WidgetDefinition.objects.create(**payload)
        intent_send = WidgetDefIntent.objects.filter(widget_definition=instance, send=True)
        intent_receive = WidgetDefIntent.objects.filter(widget_definition=instance, receive=True)

        self.assertTrue(isinstance(instance, WidgetDefinition))

        self.assertEqual(intent_send.count(), 2)
        self.assertEqual(intent_receive.count(), 2)
        self.assertEqual(IntentDataTypes.objects.count(), 3)
        self.assertEqual(WidgetDefIntent.objects.count(), 4)
        self.assertEqual(WidgetDefIntentDataTypes.objects.count(), 6)

        self.assertIn('act', intent_send.values_list('intent__action', flat=True))
        self.assertIn('act', intent_receive.values_list('intent__action', flat=True))

        self.assertIn('type-1', intent_send.filter(intent__action='act').values_list(
            'widgetdefintentdatatypes__intent_data_type__data_type', flat=True))

        self.assertIn('type-2', intent_send.filter(intent__action='act').values_list(
            'widgetdefintentdatatypes__intent_data_type__data_type', flat=True))

        self.assertNotIn('another_type', intent_send.filter(intent__action='act').values_list(
            'widgetdefintentdatatypes__intent_data_type__data_type', flat=True))

        self.assertNotIn('type-1', intent_receive.filter(intent__action='another').values_list(
            'widgetdefintentdatatypes__intent_data_type__data_type', flat=True))

    def test_delete_widget(self):
        widget = WidgetDefinition.objects.get(pk=1)
        widget.delete()

        self.assertFalse(DomainMapping.objects.filter(pk=3).exists())
        self.assertFalse(DomainMapping.objects.filter(pk=4).exists())

        self.assertTrue(Person.objects.filter(pk=1, requires_sync=True).exists())
        self.assertTrue(Person.objects.filter(pk=2, requires_sync=True).exists())
