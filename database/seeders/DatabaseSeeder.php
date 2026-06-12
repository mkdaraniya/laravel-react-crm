<?php

namespace Database\Seeders;

use App\Models\Activity;
use App\Models\CompanySetting;
use App\Models\Contact;
use App\Models\Deal;
use App\Models\Invoice;
use App\Models\PipelineStage;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@reactcrm.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);

        $manager = User::factory()->create([
            'name' => 'Manager User',
            'email' => 'manager@reactcrm.com',
            'password' => bcrypt('password'),
            'role' => 'manager',
        ]);

        $regular = User::factory()->create([
            'name' => 'Regular User',
            'email' => 'user@reactcrm.com',
            'password' => bcrypt('password'),
            'role' => 'user',
        ]);

        $stages = collect([
            ['name' => 'Lead', 'order' => 1, 'color' => '#94a3b8'],
            ['name' => 'Qualification', 'order' => 2, 'color' => '#3b82f6'],
            ['name' => 'Proposal', 'order' => 3, 'color' => '#8b5cf6'],
            ['name' => 'Negotiation', 'order' => 4, 'color' => '#f59e0b'],
            ['name' => 'Closed Won', 'order' => 5, 'color' => '#22c55e'],
            ['name' => 'Closed Lost', 'order' => 6, 'color' => '#ef4444'],
        ])->map(fn ($s) => PipelineStage::create($s));

        CompanySetting::create(['key' => 'company_name', 'value' => 'ReactCRM Inc.']);
        CompanySetting::create(['key' => 'company_email', 'value' => 'hello@reactcrm.com']);
        CompanySetting::create(['key' => 'company_phone', 'value' => '+1 (555) 123-4567']);
        CompanySetting::create(['key' => 'company_address', 'value' => '123 Business Ave, Suite 100, San Francisco, CA 94102']);

        $contacts = collect([
            ['first_name' => 'John', 'last_name' => 'Smith', 'email' => 'john@acme.com', 'company' => 'Acme Corp', 'status' => 'active'],
            ['first_name' => 'Sarah', 'last_name' => 'Johnson', 'email' => 'sarah@techstart.io', 'company' => 'TechStart', 'status' => 'lead'],
            ['first_name' => 'Mike', 'last_name' => 'Brown', 'email' => 'mike@globalinc.com', 'company' => 'Global Inc', 'status' => 'active'],
            ['first_name' => 'Emily', 'last_name' => 'Davis', 'email' => 'emily@designlab.co', 'company' => 'DesignLab', 'status' => 'lead'],
            ['first_name' => 'Alex', 'last_name' => 'Wilson', 'email' => 'alex@innovate.io', 'company' => 'Innovate.io', 'status' => 'inactive'],
            ['first_name' => 'Lisa', 'last_name' => 'Anderson', 'email' => 'lisa@megacorp.com', 'company' => 'MegaCorp', 'status' => 'active'],
            ['first_name' => 'David', 'last_name' => 'Taylor', 'email' => 'david@startup.io', 'company' => 'Startup.io', 'status' => 'lead'],
            ['first_name' => 'Rachel', 'last_name' => 'Martinez', 'email' => 'rachel@enterprise.co', 'company' => 'Enterprise Co', 'status' => 'lead'],
        ])->map(fn ($c) => Contact::create([...$c, 'user_id' => $admin->id]));

        $dealData = [
            ['contact' => 0, 'stage' => 0, 'name' => 'Website Redesign', 'value' => 25000],
            ['contact' => 1, 'stage' => 1, 'name' => 'Mobile App Development', 'value' => 75000],
            ['contact' => 2, 'stage' => 2, 'name' => 'Cloud Infrastructure', 'value' => 120000],
            ['contact' => 3, 'stage' => 1, 'name' => 'Brand Identity Package', 'value' => 15000],
            ['contact' => 5, 'stage' => 3, 'name' => 'Enterprise SaaS License', 'value' => 200000],
            ['contact' => 6, 'stage' => 0, 'name' => 'SEO Optimization', 'value' => 8500],
            ['contact' => 7, 'stage' => 2, 'name' => 'Data Analytics Platform', 'value' => 95000],
            ['contact' => 1, 'stage' => 4, 'name' => 'API Integration', 'value' => 35000],
        ];

        $users = [$admin, $manager, $regular];
        foreach ($dealData as $i => $d) {
            $deal = Deal::create([
                'user_id' => $users[$i % 3]->id,
                'contact_id' => $contacts[$d['contact']]->id,
                'pipeline_stage_id' => $stages[$d['stage']]->id,
                'name' => $d['name'],
                'value' => $d['value'],
                'expected_close_date' => now()->addDays(rand(15, 90)),
                'status' => $d['stage'] === 4 ? 'won' : ($d['stage'] === 5 ? 'lost' : 'open'),
            ]);

            Activity::create([
                'user_id' => $deal->user_id,
                'deal_id' => $deal->id,
                'type' => 'deal_created',
                'description' => 'Deal "' . $deal->name . '" created',
            ]);
        }

        $deals = Deal::all();

        $taskData = [
            ['title' => 'Send proposal to client', 'priority' => 'high'],
            ['title' => 'Follow up on meeting', 'priority' => 'medium'],
            ['title' => 'Prepare contract draft', 'priority' => 'high'],
            ['title' => 'Review technical requirements', 'priority' => 'medium'],
            ['title' => 'Schedule demo session', 'priority' => 'low'],
            ['title' => 'Update project timeline', 'priority' => 'medium'],
            ['title' => 'Gather additional requirements', 'priority' => 'low'],
            ['title' => 'Send invoice for milestone 1', 'priority' => 'high'],
        ];

        foreach ($taskData as $i => $t) {
            Task::create([
                'title' => $t['title'],
                'user_id' => $users[$i % 3]->id,
                'created_by' => $admin->id,
                'deal_id' => $deals->get($i % max(count($deals), 1))?->id ?? null,
                'contact_id' => $contacts[$i % count($contacts)]->id,
                'due_date' => now()->addDays(rand(3, 30)),
                'status' => $i < 3 ? 'completed' : 'pending',
                'priority' => $t['priority'],
            ]);
        }

        $invoices = [
            ['contact' => 0, 'amount' => 25000, 'status' => 'paid'],
            ['contact' => 1, 'amount' => 35000, 'status' => 'paid'],
            ['contact' => 2, 'amount' => 120000, 'status' => 'unpaid'],
            ['contact' => 3, 'amount' => 15000, 'status' => 'unpaid'],
            ['contact' => 5, 'amount' => 200000, 'status' => 'paid'],
            ['contact' => 6, 'amount' => 8500, 'status' => 'overdue'],
        ];

        foreach ($invoices as $i => $inv) {
            $contact = $contacts[$inv['contact']];
            Invoice::create([
                'contact_id' => $contact->id,
                'user_id' => $admin->id,
                'deal_id' => $deals->get($i)?->id ?? null,
                'invoice_number' => 'INV-' . str_pad($i + 1, 4, '0', STR_PAD_LEFT),
                'amount' => $inv['amount'],
                'status' => $inv['status'],
                'due_date' => now()->addDays(30),
                'paid_at' => $inv['status'] === 'paid' ? now()->subDays(rand(1, 30)) : null,
            ]);
        }

        Activity::create([
            'user_id' => $admin->id,
            'type' => 'system',
            'description' => 'CRM system initialized with sample data',
        ]);
    }
}
